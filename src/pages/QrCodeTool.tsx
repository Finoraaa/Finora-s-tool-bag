import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  QrCode,
  Download,
  Trash2,
  Sparkles,
  Link,
  Mail,
  Phone,
  Type,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type InputType = 'url' | 'text' | 'email' | 'phone';

const INPUT_TYPES: { id: InputType; icon: React.ReactNode; labelKey: string }[] = [
  { id: 'url', icon: <Link className="w-4 h-4" />, labelKey: 'qr.type_url' },
  { id: 'text', icon: <Type className="w-4 h-4" />, labelKey: 'qr.type_text' },
  { id: 'email', icon: <Mail className="w-4 h-4" />, labelKey: 'qr.type_email' },
  { id: 'phone', icon: <Phone className="w-4 h-4" />, labelKey: 'qr.type_phone' },
];

export default function QrCodeTool() {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [inputType, setInputType] = useState<InputType>('url');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getFormattedValue = useCallback((type: InputType, value: string): string => {
    const trimmed = value.trim();
    switch (type) {
      case 'email':
        return `mailto:${trimmed}`;
      case 'phone':
        return `tel:${trimmed}`;
      case 'url':
        if (trimmed && !/^https?:\/\//i.test(trimmed)) {
          return `https://${trimmed}`;
        }
        return trimmed;
      default:
        return trimmed;
    }
  }, []);

  const getPlaceholder = useCallback((type: InputType): string => {
    switch (type) {
      case 'url': return 'https://example.com';
      case 'email': return 'hello@example.com';
      case 'phone': return '+1 234 567 8900';
      case 'text': return t('qr.placeholder_text');
      default: return '';
    }
  }, [t]);

  const handleGenerate = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError(t('qr.error_empty'));
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const formatted = getFormattedValue(inputType, trimmed);
      
      const dataUrl = await QRCode.toDataURL(formatted, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });

      setQrDataUrl(dataUrl);
    } catch {
      setError(t('qr.error_generate'));
    } finally {
      setIsGenerating(false);
    }
  }, [inputValue, inputType, getFormattedValue, t]);

  const handleDownload = useCallback(() => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  }, [qrDataUrl]);

  const handleClear = useCallback(() => {
    setInputValue('');
    setQrDataUrl(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
            <QrCode className="w-3 h-3" />
            <span>QR ENGINE V1</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('qr.title')} <span className="neon-text">{t('qr.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('qr.desc')}</p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input Area */}
          <div className="space-y-6">
            {/* Input Type Selector */}
            <div className="glass-panel p-6 space-y-5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                {t('qr.input_type')}
              </label>
              <div className="grid grid-cols-4 gap-3">
                {INPUT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setInputType(type.id);
                      setError(null);
                    }}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                      inputType === type.id
                        ? 'bg-finora-accent/10 border-finora-accent text-finora-accent'
                        : 'bg-finora-border/50 border-transparent text-neutral-500 hover:border-white/10'
                    )}
                  >
                    {type.icon}
                    <span className="text-[10px] font-mono uppercase">{t(type.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="glass-panel p-6 space-y-4">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                {t('qr.input_label')}
              </label>
              <div className="relative">
                <input
                  id="qr-input"
                  type={inputType === 'email' ? 'email' : inputType === 'phone' ? 'tel' : 'text'}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder(inputType)}
                  className="w-full bg-black/40 border border-finora-border rounded-xl p-4 pr-12 font-mono text-white placeholder-neutral-600 focus:outline-none focus:border-finora-accent/50 transition-colors"
                />
                {inputValue && (
                  <button
                    onClick={() => {
                      setInputValue('');
                      setError(null);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-mono"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                id="qr-generate-btn"
                onClick={handleGenerate}
                disabled={isGenerating || !inputValue.trim()}
                className={cn(
                  'flex-1 px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 neon-glow',
                  isGenerating
                    ? 'bg-finora-accent/50 text-black cursor-wait'
                    : 'bg-finora-accent text-black hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100'
                )}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span className="uppercase tracking-widest text-sm">{t('qr.generating')}</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    <span className="uppercase tracking-widest text-sm">{t('qr.generate')}</span>
                  </>
                )}
              </button>

              <button
                id="qr-clear-btn"
                onClick={handleClear}
                disabled={!inputValue && !qrDataUrl}
                className="px-6 py-4 rounded-xl font-bold border border-finora-border text-neutral-400 hover:text-white hover:border-neutral-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <Trash2 className="w-5 h-5" />
                <span className="uppercase tracking-widest text-sm">{t('common.clear')}</span>
              </button>
            </div>
          </div>

          {/* Right: QR Code Display */}
          <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
            {qrDataUrl ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Success Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t('qr.generated')}</span>
                </div>

                {/* QR Code */}
                <div className="relative group">
                  <div className="absolute -inset-4 bg-finora-accent/5 rounded-3xl blur-xl group-hover:bg-finora-accent/10 transition-colors duration-500" />
                  <div className="relative bg-white p-4 rounded-2xl shadow-2xl">
                    <img
                      src={qrDataUrl}
                      alt="Generated QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64"
                    />
                  </div>
                </div>

                {/* Download Button */}
                <button
                  id="qr-download-btn"
                  onClick={handleDownload}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-3 hover:bg-finora-accent hover:scale-105 transition-all w-full justify-center"
                >
                  <Download className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-sm">{t('qr.download')}</span>
                </button>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4 opacity-20">
                <QrCode className="w-24 h-24" />
                <p className="font-mono text-sm text-center">{t('qr.preview_placeholder')}</p>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent shrink-0" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span>{' '}
            {t('qr.info_text')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
