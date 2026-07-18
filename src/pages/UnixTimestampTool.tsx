import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Trash2, 
  Calendar, 
  Info
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function UnixTimestampTool() {
  const { t, language } = useLanguage();
  
  // Live Clock State
  const [liveTimestamp, setLiveTimestamp] = useState(() => Math.floor(Date.now() / 1000));
  const [isPaused, setIsPaused] = useState(false);

  // Unix to Date State
  const [inputEpoch, setInputEpoch] = useState('');
  
  // Date to Unix State
  const [inputDate, setInputDate] = useState('');

  // Copy Feedback states
  const [copiedLive, setCopiedLive] = useState(false);
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [copiedSecs, setCopiedSecs] = useState(false);
  const [copiedMs, setCopiedMs] = useState(false);

  // Update live clock
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setLiveTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Copy helper
  const handleCopy = (text: string, setFeedback: (b: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2000);
  };

  // Helper: Relative Time
  const getRelativeTime = (timestampMs: number, lang: 'tr' | 'en'): string => {
    const diff = timestampMs - Date.now();
    const absDiff = Math.abs(diff);
    
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const isPast = diff < 0;

    if (seconds < 60) {
      if (lang === 'tr') return isPast ? 'Birkaç saniye önce' : 'Birkaç saniye içinde';
      return isPast ? 'A few seconds ago' : 'In a few seconds';
    }
    if (minutes < 60) {
      if (lang === 'tr') return isPast ? `${minutes} dakika önce` : `${minutes} dakika içinde`;
      return isPast ? `${minutes} minutes ago` : `In ${minutes} minutes`;
    }
    if (hours < 24) {
      if (lang === 'tr') return isPast ? `${hours} saat önce` : `${hours} saat içinde`;
      return isPast ? `${hours} hours ago` : `In ${hours} hours`;
    }
    if (lang === 'tr') return isPast ? `${days} gün önce` : `${days} gün içinde`;
    return isPast ? `${days} days ago` : `In ${days} days`;
  };

  // Convert Unix to Date Calculation
  const epochToDateResult = useMemo(() => {
    if (!inputEpoch.trim()) return null;
    
    // Parse input
    const numericEpoch = Number(inputEpoch.trim());
    if (isNaN(numericEpoch)) return { error: true };

    // Auto-detect seconds vs milliseconds
    // If the number has 12+ digits, it's likely milliseconds
    const isMs = inputEpoch.trim().length >= 12;
    const timestampMs = isMs ? numericEpoch : numericEpoch * 1000;

    try {
      const date = new Date(timestampMs);
      if (isNaN(date.getTime())) return { error: true };

      return {
        error: false,
        local: date.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US'),
        utc: date.toUTCString(),
        relative: getRelativeTime(timestampMs, language),
        isMs
      };
    } catch {
      return { error: true };
    }
  }, [inputEpoch, language]);

  // Convert Date to Unix Calculation
  const dateToEpochResult = useMemo(() => {
    if (!inputDate) return null;
    
    try {
      const date = new Date(inputDate);
      const timeMs = date.getTime();
      if (isNaN(timeMs)) return null;

      return {
        seconds: Math.floor(timeMs / 1000),
        milliseconds: timeMs
      };
    } catch {
      return null;
    }
  }, [inputDate]);

  // Actions
  const handleUseCurrentInEpochInput = () => {
    setInputEpoch(Math.floor(Date.now() / 1000).toString());
  };

  const handleUseCurrentInDateInput = () => {
    // Format local date to YYYY-MM-DDTHH:MM
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);
    setInputDate(localISOTime);
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
            {t('unix.title')} <span className="neon-text">{t('unix.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('unix.desc')}</p>
        </div>

        {/* Live Clock Card */}
        <div className="glass-panel p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-finora-accent/20">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 bg-finora-accent/10 border border-finora-accent/30 rounded-2xl flex items-center justify-center text-finora-accent animate-pulse">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-neutral-400 tracking-wider">{t('unix.current_epoch')}</div>
              <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
                {liveTimestamp}
                <span className="text-xs text-neutral-500 font-normal">({t('unix.seconds')})</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 z-10 w-full md:w-auto">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex-1 md:flex-initial px-4 py-2 bg-finora-border hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono font-bold transition-all text-neutral-300"
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
            <button
              onClick={() => handleCopy(liveTimestamp.toString(), setCopiedLive)}
              className="flex-1 md:flex-initial px-4 py-2 bg-finora-accent text-black hover:bg-opacity-90 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
            >
              {copiedLive ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLive ? t('common.copied') : t('common.copy')}
            </button>
          </div>
        </div>

        {/* Grid Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Epoch -> Date Card */}
          <div className="glass-panel p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                  <ArrowRightLeft className="w-5 h-5 text-finora-accent" />
                  {t('unix.convert_from_epoch')}
                </h3>
              </div>

              {/* Input field */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-400 tracking-wider">UNIX TIMESTAMP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputEpoch}
                    onChange={(e) => setInputEpoch(e.target.value)}
                    placeholder={t('unix.placeholder_epoch')}
                    className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-3 text-sm font-mono text-white outline-none transition-all pr-24"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button
                      onClick={handleUseCurrentInEpochInput}
                      className="px-2 py-1 bg-finora-accent/10 border border-finora-accent/30 text-finora-accent hover:bg-finora-accent/20 rounded-lg text-[10px] font-mono font-bold transition-all"
                    >
                      {t('unix.btn_now')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Result */}
              {epochToDateResult && (
                <div className="space-y-4 pt-4 border-t border-finora-border">
                  {epochToDateResult.error ? (
                    <div className="text-rose-400 text-sm font-mono flex items-center gap-2">
                      ⚠️ Invalid timestamp values
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="p-3 bg-neutral-900/50 rounded-lg border border-finora-border flex justify-between items-center">
                        <div>
                          <span className="text-neutral-500 block text-[10px] mb-1">{t('unix.local_time')}</span>
                          <span className="text-white font-medium">{epochToDateResult.local}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(epochToDateResult.local || '', setCopiedTarget)}
                          className="p-1 hover:text-finora-accent transition-colors"
                        >
                          {copiedTarget ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-3 bg-neutral-900/50 rounded-lg border border-finora-border">
                        <span className="text-neutral-500 block text-[10px] mb-1">{t('unix.utc_time')}</span>
                        <span className="text-white font-medium">{epochToDateResult.utc}</span>
                      </div>

                      <div className="p-3 bg-neutral-900/50 rounded-lg border border-finora-border">
                        <span className="text-neutral-500 block text-[10px] mb-1">{t('unix.relative_time')}</span>
                        <span className="text-finora-accent font-medium">{epochToDateResult.relative}</span>
                      </div>

                      <div className="text-[10px] text-neutral-500 italic">
                        * Auto-detected: {epochToDateResult.isMs ? t('unix.milliseconds') : t('unix.seconds')}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setInputEpoch('')}
                disabled={!inputEpoch}
                className="text-xs font-mono text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:hover:text-neutral-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('common.clear')}
              </button>
            </div>
          </div>

          {/* Date -> Epoch Card */}
          <div className="glass-panel p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-purple-400" />
                {t('unix.convert_to_epoch')}
              </h3>

              {/* Date selection input */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-400 tracking-wider">{t('unix.date_select')}</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-3 text-sm font-mono text-white outline-none transition-all pr-24"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <button
                      onClick={handleUseCurrentInDateInput}
                      className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 rounded-lg text-[10px] font-mono font-bold transition-all"
                    >
                      {t('unix.btn_now')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Result */}
              {dateToEpochResult && (
                <div className="space-y-4 pt-4 border-t border-finora-border">
                  <div className="space-y-3 font-mono text-xs">
                    
                    {/* Seconds */}
                    <div className="p-3 bg-neutral-900/50 rounded-lg border border-finora-border flex justify-between items-center">
                      <div>
                        <span className="text-neutral-500 block text-[10px] mb-1">{t('unix.seconds')}</span>
                        <span className="text-white font-medium">{dateToEpochResult.seconds}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(dateToEpochResult.seconds.toString(), setCopiedSecs)}
                        className="p-1 hover:text-finora-accent transition-colors"
                      >
                        {copiedSecs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Milliseconds */}
                    <div className="p-3 bg-neutral-900/50 rounded-lg border border-finora-border flex justify-between items-center">
                      <div>
                        <span className="text-neutral-500 block text-[10px] mb-1">{t('unix.milliseconds')}</span>
                        <span className="text-white font-medium">{dateToEpochResult.milliseconds}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(dateToEpochResult.milliseconds.toString(), setCopiedMs)}
                        className="p-1 hover:text-finora-accent transition-colors"
                      >
                        {copiedMs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setInputDate('')}
                disabled={!inputDate}
                className="text-xs font-mono text-neutral-500 hover:text-rose-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:hover:text-neutral-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('common.clear')}
              </button>
            </div>
          </div>

        </div>

        {/* Info box */}
        <div className="glass-panel p-4 flex gap-3 text-xs text-neutral-400 bg-neutral-900/20">
          <Info className="w-4 h-4 text-finora-accent shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Unix Epoch Nedir?</strong> 1 Ocak 1970 00:00:00 UTC tarihinden itibaren geçen saniye (veya milisaniye) sayısıdır.
            Bu araç tamamen tarayıcınızda yerel olarak çalışır ve verileriniz gizlilik prensiplerimiz doğrultusunda hiçbir yere gönderilmez.
          </div>
        </div>

      </motion.div>
    </div>
  );
}
