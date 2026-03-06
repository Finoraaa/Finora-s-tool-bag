import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  Copy,
  FileCode,
  Layout,
  Smartphone,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FaviconSize {
  name: string;
  size: number;
  fileName: string;
  platform: 'browser' | 'apple' | 'android';
}

const FAVICON_SIZES: FaviconSize[] = [
  { name: 'Browser (16x16)', size: 16, fileName: 'favicon-16x16.png', platform: 'browser' },
  { name: 'Browser (32x32)', size: 32, fileName: 'favicon-32x32.png', platform: 'browser' },
  { name: 'Apple Touch (180x180)', size: 180, fileName: 'apple-touch-icon.png', platform: 'apple' },
  { name: 'Android (192x192)', size: 192, fileName: 'android-chrome-192x192.png', platform: 'android' },
  { name: 'Android (512x512)', size: 512, fileName: 'android-chrome-512x512.png', platform: 'android' },
];

export default function FaviconTool() {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('image.error_invalid'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(e.target?.result as string);
        generatePreviews(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const generatePreviews = (img: HTMLImageElement) => {
    const newPreviews: { [key: string]: string } = {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    FAVICON_SIZES.forEach((fav) => {
      canvas.width = fav.size;
      canvas.height = fav.size;
      ctx?.clearRect(0, 0, fav.size, fav.size);
      ctx?.drawImage(img, 0, 0, fav.size, fav.size);
      newPreviews[fav.fileName] = canvas.toDataURL('image/png');
    });

    setPreviews(newPreviews);
  };

  const handleDownloadPack = async () => {
    if (!image) return;
    setIsGenerating(true);

    try {
      const zip = new JSZip();
      const img = new Image();
      
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = image;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Add PNGs
      for (const fav of FAVICON_SIZES) {
        canvas.width = fav.size;
        canvas.height = fav.size;
        ctx?.clearRect(0, 0, fav.size, fav.size);
        ctx?.drawImage(img, 0, 0, fav.size, fav.size);
        
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        zip.file(fav.fileName, base64Data, { base64: true });
      }

      // Add manifest.json
      const manifest = {
        name: "Finora App",
        short_name: "Finora",
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
        ],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone"
      };
      zip.file('site.webmanifest', JSON.stringify(manifest, null, 2));

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'favicon-pack.zip';
      link.click();
    } catch (error) {
      console.error('Error generating zip:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const htmlSnippet = `<!-- Favicon Links -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setImage(null);
    setPreviews({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
              <Layout className="w-3 h-3" />
              <span>ASSET GENERATION CORE</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('favicon.title')} <span className="neon-text">{t('favicon.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('favicon.desc')}</p>
          </div>

          {image && (
            <button
              onClick={handleDownloadPack}
              disabled={isGenerating}
              className="flex items-center gap-3 px-6 py-3 bg-finora-accent text-black font-bold rounded-xl hover:scale-105 transition-all neon-glow disabled:opacity-50"
            >
              <Download className={cn("w-4 h-4", isGenerating && "animate-bounce")} />
              <span>{isGenerating ? 'GENERATING...' : t('favicon.download_pack')}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Upload & Preview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel p-1 overflow-hidden">
              {!image ? (
                <div 
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-finora-border rounded-xl cursor-pointer hover:border-finora-accent/50 hover:bg-finora-accent/5 transition-all group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <div className="w-16 h-16 bg-finora-border rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-neutral-400 group-hover:text-finora-accent" />
                  </div>
                  <p className="text-lg font-medium mb-1">{t('image.drop')}</p>
                  <p className="text-sm text-neutral-500">PNG, JPG, SVG (Maks. 5MB)</p>
                </div>
              ) : (
                <div className="relative group p-8 flex items-center justify-center bg-black/40 rounded-xl">
                  <img 
                    src={image} 
                    alt="Source" 
                    className="max-h-64 object-contain shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={reset}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors"
                      title={t('common.clear')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sizes Preview Grid */}
            {image && (
              <div className="glass-panel p-6 space-y-6">
                <div className="flex items-center gap-2 text-finora-accent">
                  <Monitor className="w-4 h-4" />
                  <h4 className="font-mono text-xs uppercase tracking-widest">{t('favicon.preview_all')}</h4>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {FAVICON_SIZES.map((fav) => (
                    <div key={fav.fileName} className="flex flex-col items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg overflow-hidden">
                        <img src={previews[fav.fileName]} alt={fav.name} className="max-w-full max-h-full" />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-neutral-300">{fav.size}x{fav.size}</p>
                        <p className="text-[8px] text-neutral-500 font-mono uppercase">{fav.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Code & Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-finora-accent">
                  <FileCode className="w-4 h-4" />
                  <h4 className="font-mono text-xs uppercase tracking-widest">{t('favicon.html_code')}</h4>
                </div>
                <button 
                  onClick={handleCopyCode}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                    copied ? "bg-finora-accent text-black" : "bg-finora-border text-neutral-400 hover:text-white"
                  )}
                >
                  {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
              </div>

              <div className="relative group">
                <pre className="w-full bg-black/40 border border-finora-border rounded-xl p-4 font-mono text-[11px] text-neutral-300 overflow-x-auto">
                  <code>{htmlSnippet}</code>
                </pre>
              </div>

              <div className="p-4 bg-finora-accent/5 border border-finora-accent/10 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-finora-accent">
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">PWA Ready</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t('favicon.info_text')}
                </p>
              </div>
            </div>

            {/* Footer Log */}
            <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
              <Terminal className="w-4 h-4 text-finora-accent" />
              <p>
                <span className="text-finora-accent">SYSTEM_LOG:</span> Favicon generation uses client-side canvas rendering for privacy and speed.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
