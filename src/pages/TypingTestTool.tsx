import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Keyboard, RotateCcw, Clock, Target, Zap, Trophy, BarChart2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const TURKISH_WORDS = [
  'yazılım', 'kodlama', 'tasarım', 'teknoloji', 'bilgisayar', 'geliştirici', 'internet', 'klavye',
  'ekran', 'sistem', 'veri', 'algoritma', 'fonksiyon', 'değişken', 'döngü', 'proje', 'başarı',
  'üretkenlik', 'odaklanma', 'zaman', 'hız', 'gelecek', 'dijital', 'platform', 'mobil', 'web',
  'sayfa', 'uygulama', 'sunucu', 'veritabanı', 'güvenlik', 'performans', 'arayüz', 'deneyim'
];

const ENGLISH_WORDS = [
  'software', 'developer', 'coding', 'technology', 'design', 'computer', 'keyboard', 'internet',
  'screen', 'system', 'data', 'algorithm', 'function', 'variable', 'loop', 'project', 'success',
  'productivity', 'focus', 'time', 'speed', 'future', 'digital', 'platform', 'mobile', 'web',
  'application', 'server', 'database', 'security', 'performance', 'interface', 'experience'
];

export default function TypingTestTool() {
  const { language, t } = useLanguage();

  const [timeLimit, setTimeLimit] = useState<number>(30); // 15, 30, 60
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [wordsList, setWordsList] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [totalCharCount, setTotalCharCount] = useState(0);
  const [wordStatus, setWordStatus] = useState<('correct' | 'wrong' | 'pending')[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Generate Words
  const generateWords = () => {
    const source = language === 'tr' ? TURKISH_WORDS : ENGLISH_WORDS;
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    // Duplicate to make enough words for fast typists
    const fullList = [...shuffled, ...shuffled, ...shuffled];
    setWordsList(fullList);
    setWordStatus(new Array(fullList.length).fill('pending'));
    setWordIndex(0);
    setInputVal('');
    setCorrectCharCount(0);
    setTotalCharCount(0);
    setTimeLeft(timeLimit);
    setIsActive(false);
    setIsFinished(false);
  };

  useEffect(() => {
    generateWords();
  }, [language, timeLimit]);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isActive && !isFinished) {
      setIsActive(true);
    }

    if (value.endsWith(' ')) {
      // Spacebar pressed: check current word
      const trimmed = value.trim();
      const currentTarget = wordsList[wordIndex];

      const newStatus = [...wordStatus];
      if (trimmed === currentTarget) {
        newStatus[wordIndex] = 'correct';
        setCorrectCharCount(prev => prev + currentTarget.length + 1);
      } else {
        newStatus[wordIndex] = 'wrong';
      }
      setWordStatus(newStatus);

      setTotalCharCount(prev => prev + currentTarget.length + 1);
      setWordIndex(prev => prev + 1);
      setInputVal('');
    } else {
      setInputVal(value);
    }
  };

  // WPM & Accuracy Math
  const elapsedMinutes = (timeLimit - timeLeft) / 60 || 0.01;
  const grossWPM = Math.round((correctCharCount / 5) / elapsedMinutes) || 0;
  const accuracy = totalCharCount > 0 ? Math.round((correctCharCount / totalCharCount) * 100) : 100;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <Keyboard className="w-3 h-3" />
          <span>REALTIME WPM SPEED TEST</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('typing.title')} <span className="neon-text">{t('typing.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          {t('typing.desc')}
        </p>
      </div>

      {/* Main Container */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* Controls: Time Selector & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-finora-border/60 pb-6">
          {/* Time Limit Selector */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <div className="flex p-1 bg-finora-border rounded-xl">
              {[15, 30, 60].map(seconds => (
                <button
                  key={seconds}
                  onClick={() => { setTimeLimit(seconds); generateWords(); }}
                  disabled={isActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    timeLimit === seconds ? 'bg-finora-accent text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {seconds}s
                </button>
              ))}
            </div>
          </div>

          {/* Live Stats */}
          <div className="flex items-center gap-6 font-mono">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-finora-accent" />
              <span className="text-xs text-neutral-400">{t('typing.wpm')}:</span>
              <span className="text-xl font-bold text-white">{grossWPM}</span>
            </div>

            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-neutral-400">{t('typing.accuracy')}:</span>
              <span className="text-xl font-bold text-white">{accuracy}%</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-neutral-400">{t('typing.time')}:</span>
              <span className="text-xl font-bold text-finora-accent">{timeLeft}s</span>
            </div>
          </div>

          {/* Restart Button */}
          <button
            onClick={generateWords}
            className="p-2.5 bg-finora-border hover:bg-neutral-800 text-neutral-300 rounded-xl transition-all"
            title={t('typing.restart')}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Words Display Box */}
        {!isFinished ? (
          <div 
            onClick={() => inputRef.current?.focus()}
            className="cursor-pointer min-h-[140px] p-6 rounded-2xl bg-black/60 border border-finora-border/80 flex flex-wrap gap-3 items-center text-lg md:text-xl font-mono leading-relaxed select-none"
          >
            {wordsList.slice(Math.max(0, wordIndex - 5), wordIndex + 25).map((word, idx) => {
              const actualIdx = Math.max(0, wordIndex - 5) + idx;
              const isCurrent = actualIdx === wordIndex;
              const status = wordStatus[actualIdx];

              let colorClass = 'text-neutral-500';
              if (status === 'correct') colorClass = 'text-emerald-400';
              if (status === 'wrong') colorClass = 'text-rose-500 line-through';
              if (isCurrent) colorClass = 'text-finora-accent underline underline-offset-8 font-bold bg-finora-accent/10 px-2 py-0.5 rounded-lg';

              return (
                <span key={actualIdx} className={`transition-all ${colorClass}`}>
                  {word}
                </span>
              );
            })}
          </div>
        ) : (
          /* Finished Results Card */
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-2xl bg-finora-accent/10 border border-finora-accent/30 text-center space-y-6"
          >
            <Trophy className="w-12 h-12 text-finora-accent mx-auto animate-bounce" />
            <h3 className="text-2xl font-bold text-white font-mono">{t('typing.result_title')}</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto font-mono">
              <div className="p-4 bg-black/50 rounded-xl border border-finora-border">
                <span className="text-xs text-neutral-400 block mb-1">Karakter Hızı (WPM)</span>
                <span className="text-3xl font-extrabold text-finora-accent">{grossWPM}</span>
              </div>
              <div className="p-4 bg-black/50 rounded-xl border border-finora-border">
                <span className="text-xs text-neutral-400 block mb-1">Doğruluk Oranı</span>
                <span className="text-3xl font-extrabold text-emerald-400">{accuracy}%</span>
              </div>
              <div className="p-4 bg-black/50 rounded-xl border border-finora-border col-span-2 md:col-span-1">
                <span className="text-xs text-neutral-400 block mb-1">Doğru Karakter</span>
                <span className="text-3xl font-extrabold text-pink-400">{correctCharCount}</span>
              </div>
            </div>

            <button
              onClick={generateWords}
              className="px-6 py-3 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2 shadow-lg shadow-finora-accent/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('typing.restart')}</span>
            </button>
          </motion.div>
        )}

        {/* Input Field */}
        {!isFinished && (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={handleInputChange}
              placeholder={t('typing.start_prompt')}
              className="w-full bg-finora-bg border border-finora-border rounded-xl px-5 py-4 text-base md:text-lg font-mono focus:outline-none focus:border-finora-accent transition-colors shadow-inner"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
