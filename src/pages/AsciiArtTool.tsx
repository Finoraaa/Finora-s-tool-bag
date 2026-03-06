import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Terminal, 
  Settings2,
  Download,
  Upload,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import figlet from 'figlet';
// @ts-ignore
import standard from 'figlet/importable-fonts/Standard.js';
// @ts-ignore
import slant from 'figlet/importable-fonts/Slant.js';
// @ts-ignore
import shadow from 'figlet/importable-fonts/Shadow.js';
// @ts-ignore
import banner from 'figlet/importable-fonts/Banner.js';

import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Register fonts for figlet
figlet.parseFont('Standard', standard);
figlet.parseFont('Slant', slant);
figlet.parseFont('Shadow', shadow);
figlet.parseFont('Banner', banner);

type Mode = 'text' | 'image';
const FONTS = ['Standard', 'Slant', 'Shadow', 'Banner'];
const CHAR_SETS = {
  standard: '@%#*+=-:. ',
  blocks: '█▓▒░ ',
  minimal: '#+- ',
  detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '
};

export default function AsciiArtTool() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('text');
  const [inputText, setInputText] = useState('FINORA');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [font, setFont] = useState('Standard');
  const [width, setWidth] = useState(80);
  const [contrast, setContrast] = useState(1);
  const [charSet, setCharSet] = useState<keyof typeof CHAR_SETS>('standard');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateTextAscii = useCallback(() => {
    figlet.text(inputText, {
      font: font as any,
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: width,
      whitespaceBreak: true
    }, (err, data) => {
      if (err) {
        console.error('Figlet error:', err);
        return;
      }
      setOutput(data || '');
    });
  }, [inputText, font, width]);

  const generateImageAscii = useCallback((imgSrc: string) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate dimensions to maintain aspect ratio
      const aspectRatio = img.height / img.width;
      const h = Math.floor(width * aspectRatio * 0.5); // 0.5 factor because characters are taller than wide
      
      canvas.width = width;
      canvas.height = h;
      
      ctx.drawImage(img, 0, 0, width, h);
      const imageData = ctx.getImageData(0, 0, width, h);
      const pixels = imageData.data;
      
      let ascii = '';
      const chars = CHAR_SETS[charSet];
      
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          // Calculate brightness
          let brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          
          // Apply contrast
          brightness = Math.pow(brightness, contrast);
          
          const charIndex = Math.floor(brightness * (chars.length - 1));
          ascii += chars[charIndex];
        }
        ascii += '\n';
      }
      setOutput(ascii);
    };
    img.src = imgSrc;
  }, [width, contrast, charSet]);

  useEffect(() => {
    if (mode === 'text') {
      generateTextAscii();
    } else if (mode === 'image' && inputImage) {
      generateImageAscii(inputImage);
    }
  }, [mode, inputText, inputImage, font, width, contrast, charSet, generateTextAscii, generateImageAscii]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setInputImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
              <Terminal className="w-3 h-3" />
              <span>TERMINAL ART ENGINE</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('ascii.title')} <span className="neon-text">{t('ascii.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('ascii.desc')}</p>
          </div>

          <div className="flex bg-finora-border/30 rounded-xl p-1">
            <button
              onClick={() => setMode('text')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                mode === 'text' ? "bg-finora-accent text-black shadow-lg" : "text-neutral-500 hover:text-white"
              )}
            >
              <Type className="w-4 h-4" />
              {t('ascii.mode_text')}
            </button>
            <button
              onClick={() => setMode('image')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                mode === 'image' ? "bg-finora-accent text-black shadow-lg" : "text-neutral-500 hover:text-white"
              )}
            >
              <ImageIcon className="w-4 h-4" />
              {t('ascii.mode_image')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-2 text-finora-accent mb-2">
                <Settings2 className="w-4 h-4" />
                <h4 className="font-mono text-xs uppercase tracking-widest">{t('ascii.settings')}</h4>
              </div>

              {mode === 'text' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-2">{t('common.input')}</label>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-black/40 border border-finora-border rounded-lg px-4 py-2 text-sm focus:border-finora-accent/50 outline-none transition-all"
                      placeholder={t('ascii.placeholder')}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-2">{t('ascii.font')}</label>
                    <select
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                      className="w-full bg-black/40 border border-finora-border rounded-lg px-4 py-2 text-sm focus:border-finora-accent/50 outline-none transition-all appearance-none"
                    >
                      {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-finora-border rounded-xl cursor-pointer hover:border-finora-accent/50 hover:bg-finora-accent/5 transition-all group overflow-hidden relative"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {inputImage ? (
                      <img src={inputImage} alt="Preview" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-neutral-400 mb-2 group-hover:text-finora-accent" />
                        <span className="text-xs text-neutral-500">{t('image.drop')}</span>
                      </>
                    )}
                    {inputImage && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-2">{t('ascii.chars')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.keys(CHAR_SETS).map(set => (
                        <button
                          key={set}
                          onClick={() => setCharSet(set as any)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all",
                            charSet === set ? "bg-finora-accent border-finora-accent text-black" : "border-finora-border text-neutral-500 hover:border-white/20"
                          )}
                        >
                          {set}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] uppercase font-mono text-neutral-500">{t('ascii.contrast')}</label>
                      <span className="text-[10px] font-mono text-finora-accent">{contrast.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-full accent-finora-accent"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] uppercase font-mono text-neutral-500">{t('ascii.width')}</label>
                  <span className="text-[10px] font-mono text-finora-accent">{width}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="1"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full accent-finora-accent"
                />
              </div>

              <button
                onClick={() => { setInputText(''); setInputImage(null); setOutput(''); }}
                className="w-full flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500/10 transition-all text-sm font-bold"
              >
                <Trash2 className="w-4 h-4" />
                {t('common.clear')}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-finora-accent">
                <Monitor className="w-4 h-4" />
                <h4 className="font-mono text-xs uppercase tracking-widest">{t('common.output')}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!output}
                  className="p-2 bg-finora-border/30 text-neutral-400 rounded-lg hover:text-white transition-colors disabled:opacity-30"
                  title="Download .txt"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleCopy}
                  disabled={!output}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all disabled:opacity-30",
                    copied ? "bg-finora-accent text-black" : "bg-finora-border text-neutral-400 hover:text-white"
                  )}
                >
                  {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? t('common.copied') : t('common.copy')}
                </button>
              </div>
            </div>

            <div className="glass-panel p-1 min-h-[500px] bg-black/60 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,_var(--finora-accent)_0%,_transparent_70%)]" />
              <pre className="w-full h-[600px] p-6 font-mono text-[10px] leading-[1] text-finora-accent overflow-auto whitespace-pre select-all">
                <code>{output || t('common.result_placeholder')}</code>
              </pre>
            </div>

            <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
              <Terminal className="w-4 h-4 text-finora-accent" />
              <p>
                <span className="text-finora-accent">SYSTEM_LOG:</span> ASCII rendering complete. Width: {width}ch. Mode: {mode.toUpperCase()}.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
