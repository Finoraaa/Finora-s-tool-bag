import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Disc, Play, Plus, Trash2, RotateCcw, Volume2, VolumeX, Trophy, Sparkles, Info, RefreshCw, BookmarkPlus, Share2, Check, Bookmark } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WheelOption {
  id: string;
  text: string;
  color: string;
}

interface CustomTemplate {
  id: string;
  title: string;
  options: WheelOption[];
}

const DEFAULT_COLORS = [
  '#ec4899', '#3b82f6', '#10b981', '#f59e0b', 
  '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'
];

export default function DecisionMakerTool() {
  const { t } = useLanguage();

  const [options, setOptions] = useState<WheelOption[]>([
    { id: '1', text: 'Burger 🍔', color: '#ec4899' },
    { id: '2', text: 'Pizza 🍕', color: '#3b82f6' },
    { id: '3', text: 'Sushi 🍣', color: '#10b981' },
    { id: '4', text: 'Tako 🌮', color: '#f59e0b' },
    { id: '5', text: 'Salata 🥗', color: '#8b5cf6' },
    { id: '6', text: 'Döner 🍢', color: '#06b6d4' }
  ]);

  const [newOptionText, setNewOptionText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Custom Templates & Sharing State
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('finora_custom_wheel_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Wheel Physics Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef<number>(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load URL query parameters on mount for template sharing
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const sharedData = searchParams.get('wheel');
      if (sharedData) {
        const rawBase64 = decodeURIComponent(sharedData);
        const binaryStr = atob(rawBase64);
        const jsonStr = decodeURIComponent(binaryStr.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(jsonStr);

        if (Array.isArray(decoded) && decoded.length >= 2) {
          const loadedOptions: WheelOption[] = decoded.map((item: any, idx: number) => ({
            id: (Date.now() + idx).toString(),
            text: typeof item === 'string' ? item : item.text || `Option ${idx + 1}`,
            color: typeof item === 'object' && item.color ? item.color : DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
          }));
          setOptions(loadedOptions);
        }
      }
    } catch (e) {
      console.error('Error parsing shared wheel data:', e);
    }
  }, []);

  // Save custom templates to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('finora_custom_wheel_templates', JSON.stringify(customTemplates));
    } catch (e) {
      console.error('Error saving custom templates:', e);
    }
  }, [customTemplates]);

  // Trigger web audio click sound on section rotation
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {
      // Audio context fallbacks
    }
  };

  // Draw Wheel on Canvas
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (options.length === 0) return;

    const sliceAngle = (2 * Math.PI) / options.length;

    // Draw Slices
    options.forEach((opt, i) => {
      const startAngle = angle + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = opt.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Text Label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(opt.text, radius - 20, 5);
      ctx.restore();
    });

    // Draw Outer Rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    // Draw Center Knob
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#06b6d4';
    ctx.stroke();

    // Draw Top Pointer (Indicator Arrow)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 15);
    ctx.lineTo(centerX - 16, centerY - radius + 15);
    ctx.lineTo(centerX + 16, centerY - radius + 15);
    ctx.closePath();
    ctx.fillStyle = '#ec4899';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentAngleRef.current);
  }, [options]);

  // Spin Wheel Physics Algorithm
  const spinWheel = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);

    const extraSpins = 5 + Math.random() * 5; // 5 to 10 full turns
    const randomTargetAngle = Math.random() * Math.PI * 2;
    const totalRotation = extraSpins * Math.PI * 2 + randomTargetAngle;

    const duration = 4500; // ms
    const startTime = performance.now();
    const startAngle = currentAngleRef.current;
    let lastSoundSlice = -1;

    const sliceAngle = (2 * Math.PI) / options.length;

    const animateSpin = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic physics formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalRotation * easeOut;
      currentAngleRef.current = currentAngle % (Math.PI * 2);

      // Calculate current slice under top pointer
      const pointerAngle = (Math.PI * 1.5 - currentAngle) % (Math.PI * 2);
      const normalizedPointer = pointerAngle < 0 ? pointerAngle + Math.PI * 2 : pointerAngle;
      const currentSliceIndex = Math.floor(normalizedPointer / sliceAngle);

      if (currentSliceIndex !== lastSoundSlice) {
        playClickSound();
        lastSoundSlice = currentSliceIndex;
      }

      drawWheel(currentAngleRef.current);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        const winningOption = options[currentSliceIndex];
        if (winningOption) {
          setWinner(winningOption.text);
          setHistory(prev => [winningOption.text, ...prev]);
        }
      }
    };

    requestAnimationFrame(animateSpin);
  };

  const [selectedAddColor, setSelectedAddColor] = useState<string>(DEFAULT_COLORS[0]);

  // Option Handlers
  const addOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;

    const newOpt: WheelOption = {
      id: Date.now().toString(),
      text: newOptionText.trim(),
      color: selectedAddColor || DEFAULT_COLORS[options.length % DEFAULT_COLORS.length]
    };
    setOptions(prev => {
      const nextOptions = [...prev, newOpt];
      // Automatically cycle next default color for convenience
      setSelectedAddColor(DEFAULT_COLORS[nextOptions.length % DEFAULT_COLORS.length]);
      return nextOptions;
    });
    setNewOptionText('');
  };

  const updateOptionColor = (id: string, newColor: string) => {
    setOptions(prev => prev.map(o => o.id === id ? { ...o, color: newColor } : o));
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      alert('Çarkın çalışabilmesi için en az 2 seçenek olmalıdır.');
      return;
    }
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  // Save Custom Template
  const saveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim() || options.length < 2) return;

    const newTemplate: CustomTemplate = {
      id: Date.now().toString(),
      title: templateName.trim(),
      options: [...options]
    };

    setCustomTemplates(prev => [newTemplate, ...prev]);
    setTemplateName('');
    setShowSaveModal(false);
  };

  const deleteCustomTemplate = (id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  };

  const loadCustomTemplate = (template: CustomTemplate) => {
    setWinner(null);
    setOptions([...template.options]);
  };

  // Share Wheel via URL Encoded Query String or Modal Fallback
  const [shareModalUrl, setShareModalUrl] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise<void>((resolve, reject) => {
        document.execCommand('copy') ? resolve() : reject(new Error('execCommand copy failed'));
        textArea.remove();
      });
    }
  };

  const shareWheelLink = async () => {
    try {
      const minimalData = options.map(o => ({ text: o.text, color: o.color }));
      const jsonStr = JSON.stringify(minimalData);
      // Safe UTF-8 Base64 encoding
      const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?wheel=${encodeURIComponent(base64)}`;

      await copyToClipboard(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    } catch (e) {
      console.error('Sharing link copy failed:', e);
      const minimalData = options.map(o => ({ text: o.text, color: o.color }));
      const jsonStr = JSON.stringify(minimalData);
      const base64 = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?wheel=${encodeURIComponent(base64)}`;
      setShareModalUrl(shareUrl);
    }
  };

  const loadPreset = (presetType: 'food' | 'yesno' | 'numbers' | 'activity') => {
    setWinner(null);
    if (presetType === 'food') {
      setOptions([
        { id: '1', text: 'Burger 🍔', color: '#ec4899' },
        { id: '2', text: 'Pizza 🍕', color: '#3b82f6' },
        { id: '3', text: 'Sushi 🍣', color: '#10b981' },
        { id: '4', text: 'Tako 🌮', color: '#f59e0b' },
        { id: '5', text: 'Ev Yemeği 🍲', color: '#8b5cf6' },
        { id: '6', text: 'Kebap 🍢', color: '#06b6d4' }
      ]);
    } else if (presetType === 'yesno') {
      setOptions([
        { id: '1', text: 'EVET ✅', color: '#10b981' },
        { id: '2', text: 'HAYIR ❌', color: '#f43f5e' },
        { id: '3', text: 'BELKİ ❓', color: '#f59e0b' }
      ]);
    } else if (presetType === 'numbers') {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n, idx) => ({
        id: n.toString(),
        text: `Sayı ${n}`,
        color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
      }));
      setOptions(nums);
    } else if (presetType === 'activity') {
      setOptions([
        { id: '1', text: 'Sinema 🎬', color: '#ec4899' },
        { id: '2', text: 'Doğa Yürüyüşü 🏕️', color: '#10b981' },
        { id: '3', text: 'Oyun Oyna 🎮', color: '#3b82f6' },
        { id: '4', text: 'Kitap Oku 📚', color: '#f59e0b' },
        { id: '5', text: 'Kahve & Sohbet ☕', color: '#8b5cf6' }
      ]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <Disc className="w-3 h-3" />
          <span>RANDOM DECISION WHEEL</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('decision.title')} <span className="neon-text">{t('decision.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
          {t('decision.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Wheel Canvas Display */}
        <div className="lg:col-span-7 glass-panel p-6 flex flex-col items-center justify-center space-y-6">
          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between border-b border-finora-border/60 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-3 py-1.5 rounded-xl bg-finora-accent/20 border border-finora-accent/30 text-finora-accent hover:bg-finora-accent/30 transition-all text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{t('decision.save_template')}</span>
              </button>

              <button
                onClick={shareWheelLink}
                className="px-3 py-1.5 rounded-xl bg-finora-border hover:bg-neutral-800 text-neutral-300 transition-all text-xs font-mono font-bold flex items-center gap-1.5"
              >
                {copiedShareLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-finora-accent" />}
                <span>{copiedShareLink ? t('decision.share_copied') : t('decision.share_wheel')}</span>
              </button>
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-finora-border hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all text-xs flex items-center gap-2 font-mono"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-finora-accent" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{t('decision.sound_effects')}</span>
            </button>
          </div>

          {/* Wheel Canvas Container */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="w-full h-full block cursor-pointer"
              onClick={spinWheel}
            />

            {/* Winner Overlay Popup */}
            <AnimatePresence>
              {winner && !isSpinning && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-full flex flex-col items-center justify-center p-6 text-center space-y-3 z-20 border-2 border-finora-accent"
                >
                  <Sparkles className="w-10 h-10 text-finora-accent animate-bounce" />
                  <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">{t('decision.winner_title')}</span>
                  <h3 className="text-3xl font-extrabold text-white neon-text px-4 py-2 bg-finora-accent/10 rounded-2xl border border-finora-accent/30">
                    {winner}
                  </h3>
                  <button
                    onClick={spinWheel}
                    className="mt-2 px-5 py-2.5 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>TEKRAR ÇEVİR</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Spin Action Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning || options.length < 2}
            className={`w-full max-w-sm py-4 rounded-2xl font-mono font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-xl ${
              isSpinning
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-finora-accent text-black hover:opacity-90 shadow-finora-accent/20 active:scale-95'
            }`}
          >
            <Play className={`w-5 h-5 fill-current ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? t('decision.spinning') : t('decision.spin')}</span>
          </button>
        </div>

        {/* Right Column: Option List & Presets & Custom Templates */}
        <div className="lg:col-span-5 space-y-6">
          {/* Options Panel */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-mono text-sm font-bold tracking-wider text-neutral-300 flex items-center gap-2">
              <Disc className="w-4 h-4 text-finora-accent" />
              <span>{t('decision.options_list')} ({options.length})</span>
            </h3>

            {/* Add Option Form with Color Selector */}
            <form onSubmit={addOption} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOptionText}
                  onChange={e => setNewOptionText(e.target.value)}
                  placeholder={t('decision.placeholder_option')}
                  className="flex-1 bg-finora-bg border border-finora-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-finora-accent transition-colors"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>EKLE</span>
                </button>
              </div>

              {/* Color Selector Bar for New Option */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase mr-1">Renk:</span>
                {DEFAULT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedAddColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      selectedAddColor === c ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </form>

            {/* Options Scroll List */}
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-finora-border/40 border border-finora-border/60 hover:border-finora-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {/* Interactive Color Change */}
                    <label className="relative cursor-pointer flex items-center" title="Rengi Değiştir">
                      <div
                        className="w-5 h-5 rounded-full border border-white/30 shrink-0 hover:scale-110 transition-transform"
                        style={{ backgroundColor: opt.color }}
                      />
                      <input
                        type="color"
                        value={opt.color}
                        onChange={e => updateOptionColor(opt.id, e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </label>
                    <span className="text-sm font-medium text-neutral-200">{opt.text}</span>
                  </div>
                  <button
                    onClick={() => removeOption(opt.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* User Custom Saved Templates */}
          {customTemplates.length > 0 && (
            <div className="glass-panel p-6 space-y-3">
              <h4 className="font-mono text-xs font-bold text-finora-accent uppercase tracking-wider flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                <span>{t('decision.my_templates')}</span>
              </h4>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {customTemplates.map(tmpl => (
                  <div
                    key={tmpl.id}
                    className="flex items-center justify-between p-3 bg-finora-accent/5 hover:bg-finora-accent/10 border border-finora-accent/20 rounded-xl transition-all"
                  >
                    <button
                      onClick={() => loadCustomTemplate(tmpl)}
                      className="flex-1 text-left text-xs font-mono font-bold text-neutral-200 truncate pr-2 hover:text-finora-accent"
                    >
                      🌟 {tmpl.title} ({tmpl.options.length} Seçenek)
                    </button>
                    <button
                      onClick={() => deleteCustomTemplate(tmpl.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Presets Panel */}
          <div className="glass-panel p-6 space-y-3">
            <h4 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider">{t('decision.presets')}</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loadPreset('food')}
                className="p-3 bg-finora-border/40 hover:bg-finora-accent/10 border border-finora-border hover:border-finora-accent/30 rounded-xl text-xs font-mono font-bold text-left transition-all"
              >
                🍔 {t('decision.preset_food')}
              </button>
              <button
                onClick={() => loadPreset('yesno')}
                className="p-3 bg-finora-border/40 hover:bg-finora-accent/10 border border-finora-border hover:border-finora-accent/30 rounded-xl text-xs font-mono font-bold text-left transition-all"
              >
                ✅ {t('decision.preset_yesno')}
              </button>
              <button
                onClick={() => loadPreset('numbers')}
                className="p-3 bg-finora-border/40 hover:bg-finora-accent/10 border border-finora-border hover:border-finora-accent/30 rounded-xl text-xs font-mono font-bold text-left transition-all"
              >
                🔢 {t('decision.preset_numbers')}
              </button>
              <button
                onClick={() => loadPreset('activity')}
                className="p-3 bg-finora-border/40 hover:bg-finora-accent/10 border border-finora-border hover:border-finora-accent/30 rounded-xl text-xs font-mono font-bold text-left transition-all"
              >
                🎯 {t('decision.preset_activity')}
              </button>
            </div>
          </div>

          {/* History Panel */}
          {history.length > 0 && (
            <div className="glass-panel p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-finora-accent" />
                  <span>{t('decision.history')}</span>
                </h4>
                <button
                  onClick={() => setHistory([])}
                  className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300"
                >
                  {t('decision.clear_history')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-finora-border rounded-lg text-xs font-mono text-finora-accent border border-finora-accent/20"
                  >
                    #{idx + 1} {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 w-full max-w-md space-y-4 border-finora-accent/30"
            >
              <h3 className="font-mono font-bold text-lg text-neutral-200">
                💾 {t('decision.save_template')}
              </h3>
              <p className="text-xs text-neutral-400">
                Mevcut {options.length} seçeneği özel şablonlarınız arasına kaydetmek için bir başlık girin.
              </p>
              <form onSubmit={saveCustomTemplate} className="space-y-4">
                <input
                  type="text"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  placeholder="Örn: Akşam Oyunu Seçenekleri"
                  autoFocus
                  className="w-full bg-finora-bg border border-finora-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-finora-accent"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 bg-finora-border text-neutral-400 rounded-xl text-xs font-mono font-bold"
                  >
                    İPTAL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-finora-accent text-black rounded-xl text-xs font-mono font-bold hover:opacity-90"
                  >
                    KAYDET
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Link Fallback Modal */}
      <AnimatePresence>
        {shareModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 w-full max-w-lg space-y-4 border-finora-accent/30"
            >
              <h3 className="font-mono font-bold text-lg text-neutral-200 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-finora-accent" />
                <span>{t('decision.share_wheel')}</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Aşağıdaki özel bağlantıyı kopyalayarak bu çarkı arkadaşlarınızla paylaşabilirsiniz:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareModalUrl}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-finora-bg border border-finora-border rounded-xl px-4 py-3 text-xs font-mono text-neutral-300 focus:outline-none focus:border-finora-accent"
                />
                <button
                  onClick={() => {
                    copyToClipboard(shareModalUrl);
                    setCopiedShareLink(true);
                    setTimeout(() => setCopiedShareLink(false), 2500);
                  }}
                  className="px-4 py-3 bg-finora-accent text-black rounded-xl text-xs font-mono font-bold hover:opacity-90 shrink-0"
                >
                  {copiedShareLink ? t('decision.share_copied') : t('common.copy')}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShareModalUrl(null)}
                  className="px-5 py-2 bg-finora-border text-neutral-300 rounded-xl text-xs font-mono font-bold hover:bg-neutral-800"
                >
                  KAPAT
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
