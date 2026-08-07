import React, { useState, useRef, useEffect } from 'react';
import { CloudRain, Zap, Volume2, VolumeX, Sparkles, Sliders } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SoundTrack {
  id: string;
  nameKey: string;
  emoji: string;
  freq: number;
  type: OscillatorType | 'noise';
  color: string;
}

export default function AtmosphereMixerTool() {
  const { t } = useLanguage();

  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 0,
    thunder: 0,
    waves: 0,
    wind: 0,
    fire: 0,
    cafe: 0,
    birds: 0
  });

  const [isPlayingAny, setIsPlayingAny] = useState(false);

  // Web Audio Procedural Synth Engine Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({});

  const soundTracks: SoundTrack[] = [
    { id: 'rain', nameKey: 'atmosphere.rain', emoji: '🌧️', freq: 320, type: 'noise', color: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'thunder', nameKey: 'atmosphere.thunder', emoji: '🌩️', freq: 90, type: 'sine', color: 'from-amber-500/20 to-purple-500/20' },
    { id: 'waves', nameKey: 'atmosphere.waves', emoji: '🌊', freq: 150, type: 'triangle', color: 'from-teal-500/20 to-blue-500/20' },
    { id: 'wind', nameKey: 'atmosphere.wind', emoji: '🌬️', freq: 220, type: 'sine', color: 'from-slate-500/20 to-zinc-500/20' },
    { id: 'fire', nameKey: 'atmosphere.fire', emoji: '🔥', freq: 180, type: 'square', color: 'from-orange-500/20 to-red-500/20' },
    { id: 'cafe', nameKey: 'atmosphere.cafe', emoji: '☕', freq: 440, type: 'triangle', color: 'from-amber-700/20 to-yellow-600/20' },
    { id: 'birds', nameKey: 'atmosphere.birds', emoji: '🐦', freq: 880, type: 'sine', color: 'from-emerald-500/20 to-lime-500/20' }
  ];

  // Initialize Web Audio procedural sound generators
  const initAudioEngine = () => {
    if (audioCtxRef.current) return;

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      soundTracks.forEach(track => {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.connect(ctx.destination);
        gainNodesRef.current[track.id] = gain;

        if (track.type === 'noise') {
          // White noise buffer for rain
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(gain);
          whiteNoise.start();
        } else {
          // Procedural LFO Modulated Synthesizer
          const osc = ctx.createOscillator();
          osc.type = track.type as OscillatorType;
          osc.frequency.setValueAtTime(track.freq, ctx.currentTime);

          // Subtle LFO modulation for ambient organic feel
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(0.2, ctx.currentTime);
          lfoGain.gain.setValueAtTime(15, ctx.currentTime);
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          lfo.start();

          osc.connect(gain);
          osc.start();
        }
      });
    } catch (e) {
      console.error('Audio engine init error:', e);
    }
  };

  const handleVolumeChange = (id: string, newVol: number) => {
    if (!audioCtxRef.current) {
      initAudioEngine();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    setVolumes(prev => {
      const updated = { ...prev, [id]: newVol };
      const hasActive = Object.values(updated).some(v => v > 0);
      setIsPlayingAny(hasActive);
      return updated;
    });

    const gainNode = gainNodesRef.current[id];
    if (gainNode && audioCtxRef.current) {
      // Smooth exponential gain curve
      const normalizedGain = Math.pow(newVol / 100, 2) * 0.4;
      gainNode.gain.setTargetAtTime(normalizedGain, audioCtxRef.current.currentTime, 0.05);
    }
  };

  const stopAll = () => {
    setVolumes({
      rain: 0,
      thunder: 0,
      waves: 0,
      wind: 0,
      fire: 0,
      cafe: 0,
      birds: 0
    });
    setIsPlayingAny(false);
    if (audioCtxRef.current) {
      Object.keys(gainNodesRef.current).forEach(id => {
        gainNodesRef.current[id].gain.setTargetAtTime(0, audioCtxRef.current!.currentTime, 0.05);
      });
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <CloudRain className="w-3 h-3" />
          <span>WHITE NOISE & AMBIENCE SYNTH</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('atmosphere.title')} <span className="neon-text">{t('atmosphere.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          {t('atmosphere.desc')}
        </p>
      </div>

      {/* Main Panel */}
      <div className="glass-panel p-6 md:p-8 space-y-8">
        {/* Top Actions */}
        <div className="flex items-center justify-between border-b border-finora-border/60 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Sliders className="w-4 h-4 text-finora-accent" />
            <span>SES KANALLARI MİKSERİ</span>
          </div>

          <button
            onClick={stopAll}
            disabled={!isPlayingAny}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              isPlayingAny
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                : 'bg-finora-border text-neutral-500 cursor-not-allowed'
            }`}
          >
            <VolumeX className="w-4 h-4" />
            <span>{t('atmosphere.stop_all')}</span>
          </button>
        </div>

        {/* Mixer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {soundTracks.map(track => {
            const vol = volumes[track.id] || 0;
            const isActive = vol > 0;

            return (
              <div
                key={track.id}
                className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden bg-gradient-to-br ${track.color} ${
                  isActive ? 'border-finora-accent/50 shadow-xl shadow-finora-accent/5' : 'border-finora-border/60 hover:border-finora-accent/20'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{track.emoji}</span>
                    <span className="font-mono text-sm font-bold text-white">{t(track.nameKey)}</span>
                  </div>
                  <span className="font-mono text-xs text-finora-accent font-bold">{vol}%</span>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vol}
                  onChange={e => handleVolumeChange(track.id, Number(e.target.value))}
                  className="w-full accent-finora-accent cursor-pointer bg-neutral-800 rounded-lg h-2"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
