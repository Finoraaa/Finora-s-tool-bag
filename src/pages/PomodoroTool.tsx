import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Minus,
  Plus,
  Terminal,
  Bell,
  Coffee,
  Brain,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

const PRESETS = [15, 20, 25, 30, 45, 60];

function playNotificationSound() {
  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  const notes = [
    { freq: 830, start: 0, dur: 0.15 },
    { freq: 830, start: 0.2, dur: 0.15 },
    { freq: 830, start: 0.4, dur: 0.15 },
    { freq: 1050, start: 0.65, dur: 0.3 },
  ];

  notes.forEach(({ freq, start, dur }) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + start);
    osc.stop(audioCtx.currentTime + start + dur + 0.05);
  });
}

export default function PomodoroTool() {
  const { t } = useLanguage();
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [status, setStatus] = useState<TimerStatus>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = sessionMinutes * 60;
  const progress = 1 - secondsLeft / totalSeconds;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer();
            setStatus('finished');
            playNotificationSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [status, clearTimer]);

  const handleStart = () => {
    if (status === 'finished') {
      setSecondsLeft(sessionMinutes * 60);
    }
    setStatus('running');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleReset = () => {
    clearTimer();
    setStatus('idle');
    setSecondsLeft(sessionMinutes * 60);
  };

  const adjustSession = (delta: number) => {
    if (status === 'running') return;
    const newVal = Math.max(1, Math.min(120, sessionMinutes + delta));
    setSessionMinutes(newVal);
    if (status === 'idle' || status === 'finished') {
      setSecondsLeft(newVal * 60);
      setStatus('idle');
    }
  };

  const selectPreset = (mins: number) => {
    if (status === 'running') return;
    setSessionMinutes(mins);
    setSecondsLeft(mins * 60);
    setStatus('idle');
  };

  // SVG circle parameters
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
            <Timer className="w-3 h-3" />
            <span>FOCUS ENGINE V1</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('pomodoro.title')} <span className="neon-text">{t('pomodoro.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('pomodoro.desc')}</p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Timer Display — 3 cols */}
          <div className="lg:col-span-3 glass-panel p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background glow */}
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-1000',
                status === 'running'
                  ? 'opacity-100'
                  : status === 'finished'
                    ? 'opacity-100'
                    : 'opacity-0'
              )}
              style={{
                background:
                  status === 'finished'
                    ? 'radial-gradient(circle at center, rgba(239,68,68,0.08) 0%, transparent 70%)'
                    : 'radial-gradient(circle at center, rgba(0,255,0,0.05) 0%, transparent 70%)',
              }}
            />

            {/* Circular Timer */}
            <div className="relative z-10">
              <svg
                width="320"
                height="320"
                viewBox="0 0 320 320"
                className="transform -rotate-90"
              >
                {/* Track */}
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className="text-finora-border"
                  strokeWidth="6"
                />
                {/* Progress */}
                <circle
                  cx="160"
                  cy="160"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  className={cn(
                    'transition-all duration-500',
                    status === 'finished' ? 'text-red-500' : 'text-finora-accent'
                  )}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{
                    filter:
                      status === 'finished'
                        ? 'drop-shadow(0 0 8px rgba(239,68,68,0.5))'
                        : status === 'running'
                          ? 'drop-shadow(0 0 8px rgba(0,255,0,0.4))'
                          : 'none',
                  }}
                />
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                  {status === 'finished' ? (
                    <motion.div
                      key="finished"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <Bell className="w-10 h-10 text-red-500" />
                      </motion.div>
                      <span className="text-red-400 font-bold text-lg uppercase tracking-widest font-mono">
                        {t('pomodoro.times_up')}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2"
                    >
                      <span
                        className={cn(
                          'text-7xl font-bold font-mono tracking-tight tabular-nums',
                          status === 'running' && 'text-white',
                          status === 'paused' && 'text-yellow-400',
                          status === 'idle' && 'text-neutral-300'
                        )}
                      >
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                        {status === 'running'
                          ? t('pomodoro.status_running')
                          : status === 'paused'
                            ? t('pomodoro.status_paused')
                            : t('pomodoro.status_ready')}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 flex items-center gap-4 mt-8">
              {status === 'running' ? (
                <button
                  id="pomodoro-pause-btn"
                  onClick={handlePause}
                  className="px-8 py-4 bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-3 hover:scale-105 transition-all"
                >
                  <Pause className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-sm">{t('pomodoro.pause')}</span>
                </button>
              ) : (
                <button
                  id="pomodoro-start-btn"
                  onClick={handleStart}
                  className="px-8 py-4 bg-finora-accent text-black font-bold rounded-xl flex items-center gap-3 hover:scale-105 transition-all neon-glow"
                >
                  <Play className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-sm">
                    {status === 'paused' ? t('pomodoro.resume') : t('pomodoro.start')}
                  </span>
                </button>
              )}

              <button
                id="pomodoro-reset-btn"
                onClick={handleReset}
                disabled={status === 'idle'}
                className="px-6 py-4 rounded-xl font-bold border border-finora-border text-neutral-400 hover:text-white hover:border-neutral-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="uppercase tracking-widest text-sm">{t('pomodoro.reset')}</span>
              </button>
            </div>
          </div>

          {/* Right sidebar — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Length */}
            <div className="glass-panel p-6 space-y-5">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                  {t('pomodoro.session_length')}
                </label>
                <span className="text-2xl font-bold text-finora-accent font-mono">
                  {sessionMinutes}<span className="text-sm text-neutral-500 ml-1">min</span>
                </span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => adjustSession(-1)}
                  disabled={status === 'running'}
                  className="w-10 h-10 bg-finora-border rounded-lg flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={sessionMinutes}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSessionMinutes(val);
                    if (status !== 'running') {
                      setSecondsLeft(val * 60);
                      if (status === 'finished') setStatus('idle');
                    }
                  }}
                  disabled={status === 'running'}
                  className="flex-1 accent-finora-accent bg-finora-border h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-30"
                />
                <button
                  onClick={() => adjustSession(1)}
                  disabled={status === 'running'}
                  className="w-10 h-10 bg-finora-border rounded-lg flex items-center justify-center hover:bg-neutral-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="glass-panel p-6 space-y-5">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                {t('pomodoro.presets')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PRESETS.map((mins) => (
                  <button
                    key={mins}
                    onClick={() => selectPreset(mins)}
                    disabled={status === 'running'}
                    className={cn(
                      'p-3 rounded-xl border font-mono text-sm font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed',
                      sessionMinutes === mins
                        ? 'bg-finora-accent/10 border-finora-accent text-finora-accent'
                        : 'bg-finora-border/50 border-transparent text-neutral-500 hover:border-white/10'
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="glass-panel p-6 space-y-4">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 block">
                {t('pomodoro.technique')}
              </label>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Brain className="w-5 h-5 text-finora-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold mb-1">{t('pomodoro.tip_focus')}</div>
                    <div className="text-xs text-neutral-500">{t('pomodoro.tip_focus_desc')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <Coffee className="w-5 h-5 text-finora-accent shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold mb-1">{t('pomodoro.tip_break')}</div>
                    <div className="text-xs text-neutral-500">{t('pomodoro.tip_break_desc')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent shrink-0" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span>{' '}
            {t('pomodoro.info_text')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
