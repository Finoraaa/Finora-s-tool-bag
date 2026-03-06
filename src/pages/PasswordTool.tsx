import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  RefreshCw, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  Shield,
  Minus,
  Plus,
  Terminal
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function PasswordTool() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState({ label: '', color: '', score: 0 });

  const generatePassword = useCallback(() => {
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let allowedChars = '';
    if (options.uppercase) allowedChars += charSets.uppercase;
    if (options.lowercase) allowedChars += charSets.lowercase;
    if (options.numbers) allowedChars += charSets.numbers;
    if (options.symbols) allowedChars += charSets.symbols;

    if (allowedChars === '') {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      generatedPassword += allowedChars[randomIndex];
    }
    setPassword(generatedPassword);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  useEffect(() => {
    const calculateStrength = () => {
      let score = 0;
      if (password.length > 8) score += 1;
      if (password.length > 12) score += 1;
      if (options.uppercase) score += 1;
      if (options.lowercase) score += 1;
      if (options.numbers) score += 1;
      if (options.symbols) score += 1;

      if (score <= 2) return { label: t('password.strength_very_weak'), color: 'text-red-500', score };
      if (score <= 4) return { label: t('password.strength_medium'), color: 'text-yellow-500', score };
      if (score <= 5) return { label: t('password.strength_strong'), color: 'text-green-500', score };
      return { label: t('password.strength_very_strong'), color: 'text-finora-accent', score };
    };
    setStrength(calculateStrength());
  }, [password, options, t]);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <Lock className="w-3 h-3" />
            <span>SECURITY PROTOCOL V2</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('password.title')} <span className="neon-text">{t('password.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('password.desc')}</p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 gap-6">
          {/* Password Display */}
          <div className="glass-panel p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-black/40 border border-finora-border rounded-xl p-6 font-mono text-2xl tracking-wider text-white break-all min-h-[80px] flex items-center justify-center relative group">
                {password || <span className="opacity-20 italic text-lg">{t('common.result_placeholder')}</span>}
                <button 
                  onClick={generatePassword}
                  className="absolute right-4 p-2 text-neutral-500 hover:text-finora-accent transition-colors"
                  title={t('password.generate')}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              
              <button 
                onClick={handleCopy}
                disabled={!password}
                className={cn(
                  "h-[80px] px-8 rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-2 neon-glow",
                  copied 
                    ? "bg-finora-accent text-black" 
                    : "bg-white text-black hover:bg-finora-accent disabled:opacity-30"
                )}
              >
                {copied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                <span className="text-xs uppercase tracking-widest">{copied ? t('common.copied') : t('common.copy')}</span>
              </button>
            </div>

            {/* Strength Indicator */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <div className={cn("flex items-center gap-2 font-bold", strength.color)}>
                {strength.score <= 2 ? <ShieldAlert className="w-5 h-5" /> : 
                 strength.score <= 4 ? <Shield className="w-5 h-5" /> : 
                 <ShieldCheck className="w-5 h-5" />}
                <span className="uppercase tracking-widest text-sm">{strength.label}</span>
              </div>
              <div className="flex-1 h-1.5 bg-finora-border rounded-full overflow-hidden flex gap-1 p-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-500",
                      i <= (strength.score / 1.5) ? (strength.score > 4 ? "bg-finora-accent" : "bg-yellow-500") : "bg-white/5"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Length Control */}
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{t('password.length')}</label>
                <span className="text-2xl font-bold text-finora-accent font-mono">{length}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setLength(Math.max(4, length - 1))}
                  className="w-10 h-10 bg-finora-border rounded-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input 
                  type="range" 
                  min="4" 
                  max="50" 
                  value={length} 
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="flex-1 accent-finora-accent bg-finora-border h-1.5 rounded-full appearance-none cursor-pointer"
                />
                <button 
                  onClick={() => setLength(Math.min(50, length + 1))}
                  className="w-10 h-10 bg-finora-border rounded-lg flex items-center justify-center hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Character Options */}
            <div className="glass-panel p-6">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 mb-6 block">{t('password.settings')}</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'uppercase', label: 'ABC', desc: t('password.uppercase') },
                  { id: 'lowercase', label: 'abc', desc: t('password.lowercase') },
                  { id: 'numbers', label: '123', desc: t('password.numbers') },
                  { id: 'symbols', label: '#$&', desc: t('password.symbols') },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id as keyof typeof options)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all group",
                      options[opt.id as keyof typeof options]
                        ? "bg-finora-accent/10 border-finora-accent text-finora-accent"
                        : "bg-finora-border/50 border-transparent text-neutral-500 hover:border-white/10"
                    )}
                  >
                    <div className="text-left">
                      <div className="font-bold text-sm">{opt.label}</div>
                      <div className="text-[10px] opacity-60">{opt.desc}</div>
                    </div>
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center transition-all",
                      options[opt.id as keyof typeof options] ? "bg-finora-accent border-finora-accent" : "border-neutral-700"
                    )}>
                      {options[opt.id as keyof typeof options] && <CheckCircle2 className="w-3 h-3 text-black" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span> En az 12 karakter ve tüm karakter tiplerini içeren parolalar kullanmanız önerilir.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
