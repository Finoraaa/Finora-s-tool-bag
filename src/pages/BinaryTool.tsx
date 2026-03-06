import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Binary, 
  Type, 
  ArrowRightLeft, 
  Copy, 
  Trash2, 
  Zap,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function BinaryTool() {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'text-to-binary' | 'binary-to-text'>('text-to-binary');
  const [copied, setCopied] = useState(false);

  const textToBinary = (text: string) => {
    return text
      .split('')
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join(' ');
  };

  const binaryToText = (binary: string) => {
    try {
      return binary
        .split(' ')
        .filter(bin => bin.trim() !== '')
        .map((bin) => String.fromCharCode(parseInt(bin, 2)))
        .join('');
    } catch (e) {
      return t('binary.error') || 'Geçersiz Binary Formatı!';
    }
  };

  useEffect(() => {
    if (input.trim() === '') {
      setOutput('');
      return;
    }

    if (mode === 'text-to-binary') {
      setOutput(textToBinary(input));
    } else {
      setOutput(binaryToText(input));
    }
  }, [input, mode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const toggleMode = () => {
    setMode(prev => prev === 'text-to-binary' ? 'binary-to-text' : 'text-to-binary');
    setInput(output); // Swap input and output for convenience
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
              <Binary className="w-3 h-3" />
              <span>DATA ENCODING CORE</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('binary.title')} <span className="neon-text">{t('binary.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('binary.desc')}</p>
          </div>

          <button
            onClick={toggleMode}
            className="flex items-center gap-3 px-6 py-3 bg-finora-border hover:bg-neutral-800 rounded-xl transition-all group border border-transparent hover:border-finora-accent/30"
          >
            <div className="flex items-center gap-2 font-mono text-sm">
              {mode === 'text-to-binary' ? (
                <>
                  <Type className="w-4 h-4 text-finora-accent" />
                  <span>{t('binary.mode_text')}</span>
                  <ArrowRightLeft className="w-4 h-4 opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                  <Binary className="w-4 h-4 text-neutral-500" />
                  <span className="opacity-40">{t('binary.mode_binary')}</span>
                </>
              ) : (
                <>
                  <Binary className="w-4 h-4 text-finora-accent" />
                  <span>{t('binary.mode_binary')}</span>
                  <ArrowRightLeft className="w-4 h-4 opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                  <Type className="w-4 h-4 text-neutral-500" />
                  <span className="opacity-40">{t('binary.mode_text')}</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 gap-6">
          {/* Input Area */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {mode === 'text-to-binary' ? `${t('common.input')}: ${t('binary.mode_text')}` : `${t('common.input')}: ${t('binary.mode_binary')}`}
              </label>
              <button 
                onClick={handleClear}
                className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                title={t('common.clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'text-to-binary' ? t('binary.placeholder_text') : t('binary.placeholder_binary')}
              className="w-full h-40 bg-black/20 border border-finora-border rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-finora-accent/50 transition-colors resize-none"
            />
          </div>

          {/* Output Area */}
          <div className="glass-panel p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-24 h-24 text-finora-accent" />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <label className="font-mono text-[10px] uppercase tracking-widest text-finora-accent">
                {mode === 'text-to-binary' ? `${t('common.output')}: ${t('binary.mode_binary')}` : `${t('common.output')}: ${t('binary.mode_text')}`}
              </label>
              <button 
                onClick={handleCopy}
                disabled={!output}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                  copied 
                    ? "bg-finora-accent text-black" 
                    : "bg-finora-border text-neutral-400 hover:text-white disabled:opacity-30"
                )}
              >
                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>

            <div className="w-full h-40 bg-finora-accent/5 border border-finora-accent/10 rounded-xl p-4 font-mono text-sm text-finora-accent break-all overflow-y-auto relative z-10">
              {output || <span className="opacity-20 italic">{t('common.result_placeholder')}</span>}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span> UTF-8 karakter kodlaması kullanılıyor. Her karakter 8-bit (1 byte) olarak temsil edilir.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
