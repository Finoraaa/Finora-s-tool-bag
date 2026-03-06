import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Palette, 
  Copy, 
  CheckCircle2, 
  Zap,
  Terminal,
  RefreshCw,
  Layers,
  Hash,
  Pipette,
  MousePointer2
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color Conversion Helpers
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToHex = (r: number, g: number, b: number) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = (h: number, s: number, v: number) => {
  h /= 360; s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export default function ColorTool() {
  const { t } = useLanguage();
  const [hsv, setHsv] = useState({ h: 120, s: 100, v: 100 });
  const [copied, setCopied] = useState<string | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const updateFromHsv = useCallback((newHsv: { h: number, s: number, v: number }) => {
    setHsv(newHsv);
  }, []);

  const generatePalette = useCallback((baseHex: string) => {
    const { h, s, l } = rgbToHsl(hexToRgb(baseHex).r, hexToRgb(baseHex).g, hexToRgb(baseHex).b);
    const newPalette = [
      baseHex,
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h + 180) % 360, s, l),
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
      hslToHex(h, s, Math.max(0, l - 20)),
      hslToHex(h, s, Math.min(100, l + 20)),
    ];
    setPalette(newPalette);
  }, []);

  useEffect(() => {
    generatePalette(hex);
  }, [hex, generatePalette]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const newHsv = rgbToHsv(r, g, b);
    updateFromHsv(newHsv);
  };

  const handleSvMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!svRef.current) return;
      const rect = svRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const s = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      const v = Math.min(100, Math.max(0, (1 - (clientY - rect.top) / rect.height) * 100));
      updateFromHsv({ ...hsv, s, v });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    move(e.nativeEvent as any);
  };

  const handleHueMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const h = Math.min(360, Math.max(0, ((clientX - rect.left) / rect.width) * 360));
      updateFromHsv({ ...hsv, h });
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    move(e.nativeEvent as any);
  };

  const handleRgbChange = (key: 'r' | 'g' | 'b', val: string) => {
    const n = Math.min(255, Math.max(0, parseInt(val) || 0));
    const newRgb = { ...rgb, [key]: n };
    updateFromHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
              <Palette className="w-3 h-3" />
              <span>CHROMATIC LAB V2.0</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('color.title')} <span className="neon-text">{t('color.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('color.desc')}</p>
          </div>

          <button
            onClick={randomColor}
            className="flex items-center gap-3 px-6 py-3 bg-finora-border hover:bg-neutral-800 rounded-xl transition-all group border border-transparent hover:border-finora-accent/30"
          >
            <RefreshCw className="w-4 h-4 text-finora-accent group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-mono text-sm uppercase tracking-widest">{t('common.random')} {t('color.title')}</span>
          </button>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Advanced Color Picker */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              {/* Saturation & Value Area */}
              <div 
                ref={svRef}
                onMouseDown={handleSvMouseDown}
                onTouchStart={handleSvMouseDown}
                className="relative w-full aspect-video rounded-xl cursor-crosshair overflow-hidden shadow-2xl"
                style={{ backgroundColor: `hsl(${hsv.h}, 100%, 50%)` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <motion.div 
                  className="absolute w-5 h-5 border-2 border-white rounded-full shadow-lg -translate-x-1/2 translate-y-1/2 pointer-events-none"
                  style={{ left: `${hsv.s}%`, bottom: `${hsv.v}%` }}
                />
              </div>

              {/* Hue Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  <span>{t('color.hue')}</span>
                  <span>{Math.round(hsv.h)}°</span>
                </div>
                <div 
                  ref={hueRef}
                  onMouseDown={handleHueMouseDown}
                  onTouchStart={handleHueMouseDown}
                  className="relative w-full h-6 rounded-full cursor-pointer overflow-hidden hue-gradient shadow-inner"
                >
                  <motion.div 
                    className="absolute top-0 bottom-0 w-2.5 bg-white shadow-md border border-black/10 rounded-full -translate-x-1/2 pointer-events-none"
                    style={{ left: `${(hsv.h / 360) * 100}%` }}
                  />
                </div>
              </div>

              {/* Controls & Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-xl border border-white/10 shadow-inner transition-colors duration-200"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{t('color.selected')}</div>
                      <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                        <span className="font-mono font-bold">{hex}</span>
                        <button onClick={() => handleCopy(hex)} className="text-neutral-500 hover:text-finora-accent transition-colors">
                          {copied === hex ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">{t('color.rgb_values')}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['r', 'g', 'b'] as const).map((k) => (
                      <div key={k} className="space-y-1">
                        <input 
                          type="number"
                          value={rgb[k]}
                          onChange={(e) => handleRgbChange(k, e.target.value)}
                          className="w-full bg-white/5 border border-white/5 rounded-lg px-2 py-2 font-mono text-center text-sm focus:outline-none focus:border-finora-accent/50 transition-colors"
                        />
                        <div className="text-[9px] text-center text-neutral-600 font-mono uppercase">{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="glass-panel p-6 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">HSL</div>
                <div className="text-sm font-mono">{hsl.h}°, {hsl.s}%, {hsl.l}%</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">HSV</div>
                <div className="text-sm font-mono">{Math.round(hsv.h)}°, {Math.round(hsv.s)}%, {Math.round(hsv.v)}%</div>
              </div>
            </div>
          </div>

          {/* Right: Palette Generation */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-panel p-8 space-y-8 h-full">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-finora-accent" />
                <h3 className="text-xl font-bold tracking-tight">{t('color.palette_title')}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {palette.map((pColor, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 group"
                  >
                    <div 
                      className="w-12 h-12 rounded-lg shadow-lg border border-white/10 flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: pColor }}
                    />
                    <div className="flex-1 flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-finora-accent/30 transition-colors">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-sm">{pColor}</div>
                        <div className="text-[9px] text-neutral-500 uppercase font-mono">
                          {i === 0 ? 'Base' : i === 1 ? 'Analogous' : i === 2 ? 'Complementary' : i < 5 ? 'Triadic' : 'Variation'}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCopy(pColor)}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          copied === pColor ? "bg-finora-accent text-black" : "text-neutral-500 hover:text-white hover:bg-white/10"
                        )}
                      >
                        {copied === pColor ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span> {t('color.pro_tip_text')}
          </p>
        </div>
      </motion.div>

      <style>{`
        .hue-gradient {
          background: linear-gradient(to right, 
            #ff0000 0%, #ffff00 17%, #00ff00 33%, 
            #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%
          );
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
