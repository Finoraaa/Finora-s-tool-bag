import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Type,
  Hash,
  Space,
  AlignLeft,
  Pilcrow,
  Trash2,
  Terminal,
  ClipboardPaste,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
}

function computeStats(text: string): TextStats {
  if (!text.trim()) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0 };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  return { words, characters, charactersNoSpaces, sentences, paragraphs };
}

export default function WordCounterTool() {
  const { t } = useLanguage();
  const [text, setText] = useState('');

  const stats = useMemo(() => computeStats(text), [text]);

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      setText(clipText);
    } catch {
      // clipboard API not available
    }
  };

  const statCards: { labelKey: string; value: number; icon: React.ReactNode; color: string }[] = [
    {
      labelKey: 'wordcounter.words',
      value: stats.words,
      icon: <Type className="w-5 h-5" />,
      color: 'text-finora-accent',
    },
    {
      labelKey: 'wordcounter.characters',
      value: stats.characters,
      icon: <Hash className="w-5 h-5" />,
      color: 'text-blue-400',
    },
    {
      labelKey: 'wordcounter.chars_no_space',
      value: stats.charactersNoSpaces,
      icon: <Space className="w-5 h-5" />,
      color: 'text-purple-400',
    },
    {
      labelKey: 'wordcounter.sentences',
      value: stats.sentences,
      icon: <AlignLeft className="w-5 h-5" />,
      color: 'text-amber-400',
    },
    {
      labelKey: 'wordcounter.paragraphs',
      value: stats.paragraphs,
      icon: <Pilcrow className="w-5 h-5" />,
      color: 'text-rose-400',
    },
  ];

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
            <FileText className="w-3 h-3" />
            <span>TEXT ANALYZER V1</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('wordcounter.title')}{' '}
            <span className="neon-text">{t('wordcounter.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('wordcounter.desc')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.labelKey}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-5 text-center group hover:border-finora-accent/30 transition-colors"
            >
              <div className={cn('mx-auto mb-2', stat.color)}>{stat.icon}</div>
              <motion.div
                key={stat.value}
                initial={{ scale: 1.15, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-3xl font-bold font-mono tabular-nums"
              >
                {stat.value.toLocaleString()}
              </motion.div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mt-1">
                {t(stat.labelKey)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Textarea */}
        <div className="glass-panel p-6 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              {t('wordcounter.input_label')}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-finora-border hover:bg-neutral-800 transition-colors text-xs font-mono text-neutral-400 hover:text-white"
              >
                <ClipboardPaste className="w-3 h-3" />
                {t('wordcounter.paste')}
              </button>
              <button
                onClick={() => setText('')}
                disabled={!text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-finora-border hover:bg-neutral-800 transition-colors text-xs font-mono text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3" />
                {t('common.clear')}
              </button>
            </div>
          </div>

          <textarea
            id="wordcounter-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('wordcounter.placeholder')}
            className="w-full h-64 bg-black/40 border border-finora-border rounded-xl p-5 font-mono text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-finora-accent/50 transition-colors resize-y leading-relaxed"
          />

          {/* Live word count bar */}
          {text.trim() && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1"
            >
              <span>
                {stats.words} {t('wordcounter.words').toLowerCase()} · {stats.characters}{' '}
                {t('wordcounter.characters').toLowerCase()}
              </span>
              <span>
                ~{Math.ceil(stats.words / 200)} min {t('wordcounter.read_time')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent shrink-0" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span>{' '}
            {t('wordcounter.info_text')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
