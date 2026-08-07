import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Zap, Play, RotateCcw, Trophy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type TestState = 'idle' | 'waiting' | 'ready' | 'result' | 'early';

export default function ReactionTestTool() {
  const { t } = useLanguage();

  const [state, setState] = useState<TestState>('idle');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('finora_reaction_best');
    return saved ? Number(saved) : null;
  });

  const timerRef = useRef<any>(null);

  const startTest = () => {
    setState('waiting');
    setReactionTime(null);

    const delay = 2000 + Math.random() * 3000; // 2 to 5 seconds
    timerRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(performance.now());
    }, delay);
  };

  const handleBoxClick = () => {
    if (state === 'waiting') {
      clearTimeout(timerRef.current);
      setState('early');
    } else if (state === 'ready') {
      const elapsed = Math.round(performance.now() - startTime);
      setReactionTime(elapsed);
      setState('result');

      if (!bestTime || elapsed < bestTime) {
        setBestTime(elapsed);
        localStorage.setItem('finora_reaction_best', elapsed.toString());
      }
    } else if (state === 'idle' || state === 'result' || state === 'early') {
      startTest();
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const getRank = (ms: number) => {
    if (ms < 190) return t('reaction.rank_god');
    if (ms < 250) return t('reaction.rank_pro');
    if (ms < 350) return t('reaction.rank_avg');
    return t('reaction.rank_slow');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <Zap className="w-3 h-3" />
          <span>MILLISECOND REACTION TIMER</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('reaction.title')} <span className="neon-text">{t('reaction.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          {t('reaction.desc')}
        </p>
      </div>

      {/* Main Click Box Display */}
      <div
        onClick={handleBoxClick}
        className={`w-full min-h-[360px] rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-300 shadow-2xl border-2 ${
          state === 'idle'
            ? 'bg-finora-border/40 border-finora-border hover:border-finora-accent/40'
            : state === 'waiting'
            ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 animate-pulse'
            : state === 'ready'
            ? 'bg-emerald-600 border-emerald-400 text-black font-extrabold shadow-emerald-500/20'
            : state === 'early'
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
            : 'bg-finora-accent/10 border-finora-accent/40 text-white'
        }`}
      >
        {state === 'idle' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-finora-accent/10 border border-finora-accent/30 flex items-center justify-center text-finora-accent mx-auto">
              <Play className="w-8 h-8 fill-current" />
            </div>
            <h3 className="text-2xl font-bold font-mono">TESTİ BAŞLATMAK İÇİN TIKLAYIN</h3>
            <p className="text-xs text-neutral-400 font-mono">Kutu yeşile döndüğünde olabildiğince hızlı tıklayın!</p>
          </div>
        )}

        {state === 'waiting' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 mx-auto animate-ping">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-extrabold font-mono">{t('reaction.wait')}</h3>
          </div>
        )}

        {state === 'ready' && (
          <div className="space-y-4">
            <Zap className="w-16 h-16 text-black mx-auto animate-bounce" />
            <h3 className="text-4xl font-extrabold font-mono tracking-wider">{t('reaction.click_now')}</h3>
          </div>
        )}

        {state === 'early' && (
          <div className="space-y-4">
            <AlertTriangle className="w-14 h-14 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-bold font-mono text-amber-300">{t('reaction.too_early')}</h3>
            <p className="text-xs font-mono text-neutral-400">Tekrar denemek için tıklayın.</p>
          </div>
        )}

        {state === 'result' && reactionTime !== null && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <CheckCircle2 className="w-12 h-12 text-finora-accent mx-auto" />
            <span className="text-xs font-mono text-neutral-400 uppercase">TEPKİ SÜRENİZ</span>
            <h2 className="text-6xl font-extrabold text-white font-mono neon-text">
              {reactionTime} <span className="text-2xl text-finora-accent">ms</span>
            </h2>
            <div className="inline-block px-4 py-2 rounded-xl bg-finora-accent/10 border border-finora-accent/30 text-finora-accent font-mono text-sm font-bold">
              {getRank(reactionTime)}
            </div>
            <p className="text-xs font-mono text-neutral-400 pt-4">Tekrar denemek için tıklayın.</p>
          </motion.div>
        )}
      </div>

      {/* Best Score Footer */}
      {bestTime && (
        <div className="p-4 rounded-xl glass-panel flex items-center justify-between font-mono text-sm">
          <div className="flex items-center gap-2 text-neutral-300">
            <Trophy className="w-4 h-4 text-finora-accent" />
            <span>EN İYİ REFLEKS REKORUNUZ:</span>
          </div>
          <span className="text-xl font-bold text-finora-accent">{bestTime} ms</span>
        </div>
      )}
    </div>
  );
}
