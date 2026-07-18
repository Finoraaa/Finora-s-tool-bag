import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Link2, 
  Copy, 
  Check, 
  Trash2, 
  QrCode, 
  Download,
  Info,
  Server,
  Key,
  Globe
} from 'lucide-react';
import QRCode from 'qrcode';
import { useLanguage } from '../contexts/LanguageContext';

export default function UrlShortenerTool() {
  const { t } = useLanguage();
  
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy Feedback states
  const [copiedShort, setCopiedShort] = useState(false);

  // Validate URL format
  const isValidUrl = useMemo(() => {
    if (!longUrl.trim()) return false;
    try {
      new URL(longUrl.trim());
      return true;
    } catch {
      return false;
    }
  }, [longUrl]);

  // URL Component Analysis
  const urlAnalysis = useMemo(() => {
    if (!isValidUrl) return null;
    try {
      const urlObj = new URL(longUrl.trim());
      const queryParams = Array.from(urlObj.searchParams.entries()).map(([key, val]) => ({
        key,
        value: val
      }));

      return {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        hash: urlObj.hash,
        queryParams
      };
    } catch {
      return null;
    }
  }, [longUrl, isValidUrl]);

  // Generate QR Code when shortened URL changes
  useEffect(() => {
    if (!shortUrl) {
      setQrCodeUrl(null);
      return;
    }

    QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(() => setQrCodeUrl(null));
  }, [shortUrl]);

  const handleShorten = async () => {
    if (!isValidUrl) {
      setError(t('url.error_invalid'));
      return;
    }

    setError(null);
    setIsLoading(true);
    setShortUrl('');

    try {
      // Use is.gd API via JSONP/JSON endpoint (Supports CORS for web apps)
      const res = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl.trim())}`);
      if (!res.ok) throw new Error('API Error');
      
      const data = await res.json();
      if (data.shorturl) {
        setShortUrl(data.shorturl);
      } else if (data.errormessage) {
        setError(data.errormessage);
      } else {
        throw new Error('Unknown API Error');
      }
    } catch {
      // Fallback: If is.gd is blocked or fails, we can use cleanuri or tinyurl (fallback fetch)
      try {
        const fallbackRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl.trim())}`);
        if (fallbackRes.ok) {
          const text = await fallbackRes.text();
          if (text.startsWith('http')) {
            setShortUrl(text);
            return;
          }
        }
        throw new Error('Fallback failed');
      } catch {
        setError(t('url.error_failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, setFeedback: (b: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `shorturl-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleClear = () => {
    setLongUrl('');
    setShortUrl('');
    setError(null);
    setQrCodeUrl(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('url.title')} <span className="neon-text">{t('url.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('url.desc')}</p>
        </div>

        {/* Input Card */}
        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-mono text-neutral-400 tracking-wider">LONG URL</label>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder={t('url.placeholder')}
                className="flex-1 bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-3 text-sm font-mono text-white outline-none transition-all"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleShorten}
                  disabled={isLoading || !longUrl.trim()}
                  className="px-6 py-3 bg-finora-accent text-black hover:bg-opacity-90 rounded-xl text-xs font-mono font-bold transition-all disabled:opacity-50 min-w-[120px]"
                >
                  {isLoading ? t('url.shortening') : t('url.shorten')}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!longUrl}
                  className="p-3 bg-finora-border hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-rose-400 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Results Panel */}
          {shortUrl && (
            <div className="pt-6 border-t border-finora-border grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Short Link Result */}
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <span className="block text-xs font-mono text-neutral-400 tracking-wider">{t('url.result_label')}</span>
                  <div className="p-4 bg-neutral-900/50 rounded-xl border border-finora-accent/20 flex justify-between items-center">
                    <a 
                      href={shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-finora-accent font-bold font-mono text-sm hover:underline break-all"
                    >
                      {shortUrl}
                    </a>
                    <button
                      onClick={() => handleCopy(shortUrl, setCopiedShort)}
                      className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-all shrink-0 ml-2"
                    >
                      {copiedShort ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-neutral-900/20 rounded-xl border border-finora-border flex gap-3 text-xs text-neutral-400">
                  <Info className="w-4 h-4 text-finora-accent shrink-0 mt-0.5" />
                  <p>
                    Kısaltılan bağlantı yönlendirmesi tamamen güvenlidir. QR Kodunu indirerek akıllı cihazlarınızda kullanabilirsiniz.
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="glass-panel p-4 flex flex-col items-center justify-center space-y-3 bg-neutral-900/40">
                <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">{t('url.qr_title')}</span>
                {qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="QR Code" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    <button
                      onClick={handleDownloadQr}
                      className="px-4 py-2 bg-finora-border hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      DOWNLOAD
                    </button>
                  </>
                ) : (
                  <div className="w-36 h-36 border border-dashed border-finora-border rounded-xl flex items-center justify-center text-neutral-600 text-xs">
                    Generating...
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* URL Component Analysis */}
        {urlAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 space-y-6"
          >
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-finora-accent" />
              {t('url.analysis_title')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-neutral-950 rounded-lg border border-finora-border flex justify-between">
                <span className="text-neutral-500">Protocol</span>
                <span className="text-white font-bold">{urlAnalysis.protocol}</span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-lg border border-finora-border flex justify-between">
                <span className="text-neutral-500">Host / Domain</span>
                <span className="text-white font-bold">{urlAnalysis.hostname}</span>
              </div>
              <div className="p-3 bg-neutral-950 rounded-lg border border-finora-border flex justify-between md:col-span-2">
                <span className="text-neutral-500">Pathname</span>
                <span className="text-white font-bold break-all">{urlAnalysis.pathname}</span>
              </div>
              {urlAnalysis.hash && (
                <div className="p-3 bg-neutral-950 rounded-lg border border-finora-border flex justify-between md:col-span-2">
                  <span className="text-neutral-500">Hash / Anchor</span>
                  <span className="text-purple-400 font-bold">{urlAnalysis.hash}</span>
                </div>
              )}
            </div>

            {/* Query Parameters Table */}
            {urlAnalysis.queryParams.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xs font-mono text-neutral-400 tracking-wider">QUERY PARAMETERS ({urlAnalysis.queryParams.length})</span>
                <div className="border border-finora-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900 text-neutral-500 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 border-b border-finora-border">{t('url.param_name')}</th>
                        <th className="px-4 py-3 border-b border-finora-border">{t('url.param_value')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-finora-border bg-neutral-950/50">
                      {urlAnalysis.queryParams.map((param, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 font-bold text-finora-accent">{param.key}</td>
                          <td className="px-4 py-3 text-neutral-300 break-all">{param.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
