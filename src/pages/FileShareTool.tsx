import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UploadCloud,
  File,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Lock,
  Unlock,
  Clock,
  Copy,
  Check,
  Download,
  Trash2,
  Eye,
  QrCode,
  ShieldCheck,
  Share2,
  Info,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import QRCode from 'qrcode';
import { useLanguage } from '../contexts/LanguageContext';

export interface StoredFileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Local Base64
  dlUrl?: string;   // Remote direct download URL
  isEncrypted: boolean;
  salt?: string;
  iv?: string;
  createdAt: number;
  expiresAt: number | null;
  downloads: number;
}

// Helpers for Crypto (AES-GCM 256)
async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(dataStr: string, password: string): Promise<{ cipherText: string; salt: string; iv: string }> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');

  const key = await deriveKey(password, saltHex);
  const enc = new TextEncoder();
  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(dataStr)
  );

  const cipherText = Array.from(new Uint8Array(encryptedBuf)).map(b => String.fromCharCode(b)).join('');
  return {
    cipherText: btoa(cipherText),
    salt: saltHex,
    iv: ivHex
  };
}

async function decryptData(cipherTextBase64: string, password: string, saltHex: string, ivHex: string): Promise<string> {
  const key = await deriveKey(password, saltHex);
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const cipherBytes = Uint8Array.from(atob(cipherTextBase64), c => c.charCodeAt(0));

  const decryptedBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuf);
}

export default function FileShareTool() {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Security & Expiration Settings
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [retention, setRetention] = useState<'1h' | '24h' | '7d' | '30d' | 'never'>('24h');

  // Active File / Download Page Mode
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [activeFile, setActiveFile] = useState<StoredFileItem | null>(null);
  const [activeShareUrl, setActiveShareUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isDownloadMode, setIsDownloadMode] = useState(false);

  // Decryption Modal State for shared links
  const [decryptInputPass, setDecryptInputPass] = useState('');
  const [decryptError, setDecryptError] = useState(false);
  const [decryptedFileContent, setDecryptedFileContent] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<StoredFileItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Load history & parse URL on mount
  useEffect(() => {
    const saved = localStorage.getItem('finora_fileshare_history');
    let parsedHistory: StoredFileItem[] = [];
    if (saved) {
      try {
        parsedHistory = JSON.parse(saved);
        const now = Date.now();
        const valid = parsedHistory.filter(item => !item.expiresAt || item.expiresAt > now);
        setHistory(valid);
        localStorage.setItem('finora_fileshare_history', JSON.stringify(valid));
      } catch (e) {
        console.error('Failed to parse file history', e);
      }
    }

    // Parse URL params e.g. ?fileId=... OR ?name=...&url=...
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('fileId');
    const nameParam = urlParams.get('name');
    const urlParam = urlParams.get('url');
    const sizeParam = urlParams.get('size');
    const typeParam = urlParams.get('type');
    const encParam = urlParams.get('enc') === '1';
    const saltParam = urlParams.get('salt');
    const ivParam = urlParams.get('iv');

    // 1. If fileId exists in localStorage
    if (fileId) {
      const found = parsedHistory.find(item => item.id === fileId);
      if (found) {
        found.downloads += 1;
        localStorage.setItem('finora_fileshare_history', JSON.stringify(parsedHistory));
        setActiveFile(found);
        setActiveShareUrl(window.location.href);
        setIsDownloadMode(true);
        if (!found.isEncrypted && found.dataUrl) {
          setDecryptedFileContent(found.dataUrl);
        }
        return;
      }
    }

    // 2. If direct URL params exist in shared link
    if (nameParam && (urlParam || fileId)) {
      const remoteItem: StoredFileItem = {
        id: fileId || 'file_' + Math.random().toString(36).substring(2, 10),
        name: nameParam,
        size: sizeParam ? parseInt(sizeParam, 10) : 0,
        type: typeParam || 'application/octet-stream',
        dlUrl: urlParam || undefined,
        isEncrypted: encParam,
        salt: saltParam || undefined,
        iv: ivParam || undefined,
        createdAt: Date.now(),
        expiresAt: null,
        downloads: 1
      };
      setActiveFile(remoteItem);
      setActiveShareUrl(window.location.href);
      setIsDownloadMode(true);
      if (!encParam && urlParam) {
        setDecryptedFileContent(urlParam);
      }
    }
  }, []);

  // Update QR Code whenever activeShareUrl changes
  useEffect(() => {
    if (!activeShareUrl) {
      setQrCodeUrl(null);
      return;
    }
    QRCode.toDataURL(activeShareUrl, {
      width: 250,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    })
      .then(url => setQrCodeUrl(url))
      .catch(() => setQrCodeUrl(null));
  }, [activeShareUrl]);

  // Handle file select
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setActiveFile(null);
    setIsDownloadMode(false);
    setDecryptedFileContent(null);

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Perform Upload (Supports local Base64 + Remote Temp Files Cloud Upload)
  const handleUpload = async () => {
    if (!selectedFile || !filePreview) return;
    setUploading(true);
    setUploadProgress('Dosya hazırlanıyor & şifreleniyor...');

    try {
      let finalDataUrl = filePreview;
      let isEncrypted = false;
      let salt: string | undefined = undefined;
      let iv: string | undefined = undefined;

      if (usePassword && password.trim()) {
        const encrypted = await encryptData(filePreview, password.trim());
        finalDataUrl = encrypted.cipherText;
        isEncrypted = true;
        salt = encrypted.salt;
        iv = encrypted.iv;
      }

      setUploadProgress('Geçici Bulut Sunucusuna Yükleniyor...');

      let remoteDlUrl: string | undefined = undefined;
      try {
        // Create Blob to upload to tmpfiles.org public free host
        const blob = isEncrypted
          ? new Blob([finalDataUrl], { type: 'text/plain' })
          : selectedFile;

        const formData = new FormData();
        formData.append('file', blob, selectedFile.name);

        const res = await fetch('https://tmpfiles.org/api/v1/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data?.url) {
            // Convert view URL to direct download URL (tmpfiles.org/dl/123/name)
            remoteDlUrl = json.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          }
        }
      } catch (cloudErr) {
        console.warn('Temp cloud upload failed, using client storage fallback', cloudErr);
      }

      // Calculate expiration timestamp
      let expiresAt: number | null = null;
      const now = Date.now();
      if (retention === '1h') expiresAt = now + 3600 * 1000;
      else if (retention === '24h') expiresAt = now + 24 * 3600 * 1000;
      else if (retention === '7d') expiresAt = now + 7 * 24 * 3600 * 1000;
      else if (retention === '30d') expiresAt = now + 30 * 24 * 3600 * 1000;

      const fileId = 'file_' + Math.random().toString(36).substring(2, 10);
      const fileItem: StoredFileItem = {
        id: fileId,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type || 'application/octet-stream',
        dataUrl: finalDataUrl,
        dlUrl: remoteDlUrl,
        isEncrypted,
        salt,
        iv,
        createdAt: now,
        expiresAt,
        downloads: 0
      };

      // Save to local history
      const updatedHistory = [fileItem, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('finora_fileshare_history', JSON.stringify(updatedHistory));

      // Construct Shareable URL with full metadata so anyone opening the link can download!
      const params = new URLSearchParams();
      params.set('fileId', fileId);
      params.set('name', selectedFile.name);
      params.set('size', selectedFile.size.toString());
      params.set('type', selectedFile.type || 'application/octet-stream');
      if (remoteDlUrl) params.set('url', remoteDlUrl);
      if (isEncrypted) {
        params.set('enc', '1');
        if (salt) params.set('salt', salt);
        if (iv) params.set('iv', iv);
      }

      const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

      setActiveFile(fileItem);
      setActiveShareUrl(shareUrl);
      setIsDownloadMode(true);
      if (!isEncrypted) {
        setDecryptedFileContent(filePreview);
      }
    } catch (err) {
      console.error('File upload failed', err);
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  // Handle Decryption
  const handleDecrypt = async () => {
    if (!activeFile || !activeFile.salt || !activeFile.iv) return;
    setDecryptError(false);

    try {
      let cipherText = activeFile.dataUrl;
      // If dataUrl not present locally, fetch from remote dlUrl
      if (!cipherText && activeFile.dlUrl) {
        setUploadProgress('Şifreli dosya indiriliyor...');
        const res = await fetch(activeFile.dlUrl);
        cipherText = await res.text();
      }

      if (!cipherText) throw new Error('No encrypted data found');

      const decrypted = await decryptData(cipherText, decryptInputPass.trim(), activeFile.salt, activeFile.iv);
      setDecryptedFileContent(decrypted);
    } catch (e) {
      console.error(e);
      setDecryptError(true);
    } finally {
      setUploadProgress('');
    }
  };

  // Download File Action
  const handleDownload = async (fileItem: StoredFileItem, contentUrl?: string) => {
    if (contentUrl) {
      const a = document.createElement('a');
      a.href = contentUrl;
      a.download = fileItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (fileItem.dlUrl) {
      window.open(fileItem.dlUrl, '_blank');
      return;
    }

    if (fileItem.dataUrl) {
      const a = document.createElement('a');
      a.href = fileItem.dataUrl;
      a.download = fileItem.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Delete from History
  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('finora_fileshare_history', JSON.stringify(updated));
    if (activeFile?.id === id) {
      setActiveFile(null);
      setIsDownloadMode(false);
      setActiveShareUrl('');
    }
  };

  // Icon selector based on mime type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-10 h-10 text-cyan-400" />;
    if (mimeType.startsWith('video/')) return <Film className="w-10 h-10 text-purple-400" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-10 h-10 text-emerald-400" />;
    if (mimeType.includes('pdf') || mimeType.includes('text')) return <FileText className="w-10 h-10 text-amber-400" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return <Archive className="w-10 h-10 text-rose-400" />;
    return <File className="w-10 h-10 text-indigo-400" />;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resetToUploadMode = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setActiveFile(null);
    setIsDownloadMode(false);
    setActiveShareUrl('');
    setDecryptedFileContent(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-10"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>GÜVENLİ DOSYA PAYLAŞIMI & DEPOLAMA</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('fileshare.title')} <span className="neon-text">{t('fileshare.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('fileshare.desc')}</p>
          </div>

          <button
            onClick={resetToUploadMode}
            className="px-4 py-2.5 bg-finora-border hover:bg-neutral-800 text-neutral-300 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4 text-finora-accent" />
            {isDownloadMode ? 'YENİ DOSYA YÜKLE' : 'SAYFAYI SIFIRLA'}
          </button>
        </div>

        {/* 🚀 DOSYA İNDİRME SAYFASI MODU (DOWNLOAD LANDING PAGE) */}
        {isDownloadMode && activeFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Top Download Card Banner */}
            <div className="glass-panel p-8 space-y-8 border-finora-accent/40 bg-neutral-900/80 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-finora-accent to-cyan-500" />

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-finora-border">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-neutral-950 border border-finora-border rounded-2xl flex items-center justify-center shrink-0">
                    {getFileIcon(activeFile.type)}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
                      🟢 İNDİRMEYE HAZIR
                    </span>
                    <h3 className="text-2xl font-bold text-white mt-1 break-all">{activeFile.name}</h3>
                    <p className="text-xs font-mono text-neutral-400 mt-1">
                      {formatSize(activeFile.size)} • {activeFile.type || 'Format belirtilmedi'}
                    </p>
                  </div>
                </div>

                {/* Back to upload button */}
                <button
                  onClick={resetToUploadMode}
                  className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-finora-border rounded-xl text-xs font-mono text-neutral-400 hover:text-white transition-all flex items-center gap-2 shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Başka Dosya Yükle
                </button>
              </div>

              {/* Encryption Lock Prompt */}
              {activeFile.isEncrypted && !decryptedFileContent && (
                <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3 text-amber-400">
                    <Lock className="w-6 h-6" />
                    <div>
                      <h4 className="font-bold text-base">{t('fileshare.decrypt_title')}</h4>
                      <p className="text-xs text-neutral-400">{t('fileshare.enter_password')}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <input
                      type="password"
                      value={decryptInputPass}
                      onChange={(e) => setDecryptInputPass(e.target.value)}
                      placeholder="Dosya erişim parolası..."
                      className="flex-1 bg-neutral-950 border border-finora-border focus:border-amber-400 rounded-xl px-4 py-3 text-sm font-mono text-white outline-none"
                    />
                    <button
                      onClick={handleDecrypt}
                      className="px-6 py-3 bg-amber-400 hover:bg-amber-500 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      {t('fileshare.decrypt_btn')}
                    </button>
                  </div>

                  {decryptError && (
                    <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {t('fileshare.wrong_password')}
                    </p>
                  )}
                </div>
              )}

              {/* MAIN GREEN DOWNLOAD BUTTON */}
              {(!activeFile.isEncrypted || decryptedFileContent) && (
                <div className="space-y-6">
                  <button
                    onClick={() => handleDownload(activeFile, decryptedFileContent || undefined)}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-base tracking-wider uppercase rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                  >
                    <Download className="w-6 h-6" />
                    <span>DOSYAYI İNDİR</span>
                    <span className="text-xs opacity-75 font-normal">({formatSize(activeFile.size)})</span>
                  </button>

                  {/* File Preview */}
                  {decryptedFileContent && (
                    <div className="space-y-3 pt-4 border-t border-finora-border">
                      <span className="block text-xs font-mono text-neutral-400 tracking-wider flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-finora-accent" />
                        {t('fileshare.preview_title')}
                      </span>
                      <div className="p-6 bg-neutral-950 rounded-2xl border border-finora-border max-h-80 overflow-auto flex items-center justify-center">
                        {activeFile.type.startsWith('image/') ? (
                          <img src={decryptedFileContent} alt={activeFile.name} className="max-h-72 object-contain rounded-xl" />
                        ) : activeFile.type.startsWith('audio/') ? (
                          <audio controls src={decryptedFileContent} className="w-full" />
                        ) : activeFile.type.startsWith('video/') ? (
                          <video controls src={decryptedFileContent} className="max-h-72 w-full rounded-xl" />
                        ) : (
                          <pre className="text-xs font-mono text-neutral-300 break-all whitespace-pre-wrap max-h-64">
                            {decryptedFileContent.slice(0, 2000)}...
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Share URL Link Container */}
              <div className="pt-4 border-t border-finora-border space-y-2">
                <span className="block text-xs font-mono text-neutral-400">{t('fileshare.share_link')}</span>
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-finora-accent/30 flex items-center justify-between gap-3">
                  <input
                    type="text"
                    readOnly
                    value={activeShareUrl}
                    className="bg-transparent border-none text-finora-accent font-mono text-xs font-bold outline-none flex-1 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-finora-accent text-black font-mono font-bold text-xs rounded-lg hover:bg-opacity-90 transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? t('common.copied') : t('common.copy')}
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code and Mobile Info for shared link */}
            {qrCodeUrl && (
              <div className="glass-panel p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-neutral-900/40">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2 justify-center md:justify-start">
                    <QrCode className="w-4 h-4 text-finora-accent" />
                    MOBİL İNDİRME QR KODU
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md font-mono">
                    Bu QR kodunu mobil cihazınızın kamerası ile okutarak dosyaya doğrudan telefonunuzdan erişebilirsiniz.
                  </p>
                </div>
                <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* 📤 YÜKLEME EKRANI MODU (UPLOAD MODE) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT 2 COLUMNS: Upload Dropzone & Configuration */}
            <div className="lg:col-span-2 space-y-6">

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`glass-panel p-10 text-center border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[240px] group ${isDragOver ? 'border-finora-accent bg-finora-accent/10' : 'border-finora-border hover:border-finora-accent/50'
                  }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <div className="w-16 h-16 bg-neutral-900 border border-finora-border rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8 text-finora-accent" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{t('fileshare.drop_title')}</h3>
                <p className="text-neutral-400 text-xs font-mono">{t('fileshare.drop_sub')}</p>
                <button className="mt-4 px-6 py-2.5 bg-finora-accent/20 border border-finora-accent/40 text-finora-accent rounded-xl text-xs font-mono font-bold hover:bg-finora-accent hover:text-black transition-all">
                  {t('fileshare.select_file')}
                </button>
              </div>

              {/* Selected File Card & Settings */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 space-y-6"
                >
                  {/* File Basic Info */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-950 rounded-xl border border-finora-border">
                    {getFileIcon(selectedFile.type)}
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-white text-sm truncate">{selectedFile.name}</h4>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">
                        {formatSize(selectedFile.size)} • {selectedFile.type || 'Bilinmeyen Format'}
                      </p>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="space-y-4 pt-2 border-t border-finora-border">
                    <span className="block text-xs font-mono text-neutral-400 tracking-wider">
                      {t('fileshare.security_settings')}
                    </span>

                    {/* Password Lock Toggle */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={usePassword}
                          onChange={(e) => setUsePassword(e.target.checked)}
                          className="w-4 h-4 rounded border-finora-border bg-finora-bg text-finora-accent focus:ring-0"
                        />
                        <span className="text-sm font-medium text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-400" />
                          {t('fileshare.enable_password')}
                        </span>
                      </label>

                      {usePassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pl-7"
                        >
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('fileshare.password_placeholder')}
                            className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-2.5 text-xs font-mono text-white outline-none"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Expiration Time Options */}
                    <div className="space-y-2">
                      <label className="block text-xs font-mono text-neutral-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-finora-accent" />
                        {t('fileshare.retention')}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-xs">
                        {[
                          { id: '1h', label: t('fileshare.retention_1h') },
                          { id: '24h', label: t('fileshare.retention_24h') },
                          { id: '7d', label: t('fileshare.retention_7d') },
                          { id: '30d', label: t('fileshare.retention_30d') },
                          { id: 'never', label: t('fileshare.retention_never') },
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setRetention(item.id as any)}
                            className={`py-2 px-3 rounded-lg border transition-all text-center ${retention === item.id
                                ? 'bg-finora-accent text-black font-bold border-finora-accent'
                                : 'bg-neutral-900 border-finora-border text-neutral-400 hover:text-white'
                              }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Submit Action */}
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-4 bg-finora-accent hover:bg-opacity-90 text-black font-mono font-bold text-xs tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {uploadProgress || t('fileshare.uploading')}
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        {t('fileshare.upload_btn')}
                      </>
                    )}
                  </button>
                </motion.div>
              )}

            </div>

            {/* RIGHT 1 COLUMN: Upload History */}
            <div className="space-y-6">

              {/* Upload History / My Files */}
              <div className="glass-panel p-6 space-y-4">
                <h3 className="text-sm font-bold font-mono text-white flex items-center justify-between border-b border-finora-border pb-3">
                  <span>{t('fileshare.history_title')}</span>
                  <span className="px-2 py-0.5 bg-finora-border rounded text-[10px] text-neutral-400">
                    {history.length} Dosya
                  </span>
                </h3>

                {history.length === 0 ? (
                  <p className="text-xs text-neutral-500 font-mono py-6 text-center">
                    {t('fileshare.no_history')}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs font-mono ${activeFile?.id === item.id
                            ? 'bg-finora-accent/10 border-finora-accent/40 text-white'
                            : 'bg-neutral-950 border-finora-border hover:border-neutral-700 text-neutral-300'
                          }`}
                      >
                        <div
                          onClick={() => {
                            setActiveFile(item);
                            setIsDownloadMode(true);
                            const params = new URLSearchParams();
                            params.set('fileId', item.id);
                            params.set('name', item.name);
                            params.set('size', item.size.toString());
                            params.set('type', item.type);
                            if (item.dlUrl) params.set('url', item.dlUrl);
                            if (item.isEncrypted) params.set('enc', '1');
                            const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
                            setActiveShareUrl(url);
                            if (!item.isEncrypted && item.dataUrl) setDecryptedFileContent(item.dataUrl);
                            else setDecryptedFileContent(null);
                          }}
                          className="flex-1 overflow-hidden cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate font-bold text-white">{item.name}</span>
                            {item.isEncrypted && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                          </div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-2 mt-1">
                            <span>{formatSize(item.size)}</span>
                            <span>•</span>
                            <span>{item.downloads} {t('fileshare.downloads')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleDownload(item)}
                            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white"
                            title={t('fileshare.download_btn')}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-neutral-400 hover:text-rose-400"
                            title={t('fileshare.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* Info Banner */}
        <div className="p-4 bg-neutral-900/30 border border-finora-border rounded-xl flex gap-3 text-xs text-neutral-400">
          <Info className="w-4 h-4 text-finora-accent shrink-0 mt-0.5" />
          <p>{t('fileshare.info_text')}</p>
        </div>

      </motion.div>
    </div>
  );
}
