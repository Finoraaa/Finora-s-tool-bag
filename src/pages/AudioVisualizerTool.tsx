import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Activity, Mic, MicOff, Download, Upload, Play, Pause, Info, BarChart2, Radio, Circle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type VisualStyle = 'bars' | 'wave' | 'circle';

export default function AudioVisualizerTool() {
  const { t } = useLanguage();

  const [mode, setMode] = useState<'mic' | 'file'>('mic');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('bars');
  
  // Mic state
  const [isMicActive, setIsMicActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);

  // File state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isFilePlaying, setIsFilePlaying] = useState(false);

  // Refs for Web Audio API
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup Web Audio API on unmount or mode switch
  const cleanupAudio = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setIsRecording(false);
    setIsFilePlaying(false);
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  // Mode change handler
  const handleModeChange = (newMode: 'mic' | 'file') => {
    cleanupAudio();
    setMode(newMode);
  };

  // Setup Canvas Visualizer Draw Loop
  const startVisualizerLoop = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)');
      bgGradient.addColorStop(1, 'rgba(2, 6, 23, 0.95)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      if (visualStyle === 'bars') {
        analyser.getByteFrequencyData(dataArray);
        const barWidth = (width / bufferLength) * 2.2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.8);

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(0.5, '#06b6d4');
          gradient.addColorStop(1, '#ec4899');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);

          x += barWidth;
        }
      } else if (visualStyle === 'wave') {
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 3;
        const waveGradient = ctx.createLinearGradient(0, 0, width, 0);
        waveGradient.addColorStop(0, '#06b6d4');
        waveGradient.addColorStop(0.5, '#a855f7');
        waveGradient.addColorStop(1, '#ec4899');
        ctx.strokeStyle = waveGradient;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (visualStyle === 'circle') {
        analyser.getByteFrequencyData(dataArray);
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.4;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.stroke();

        for (let i = 0; i < bufferLength; i += 2) {
          const angle = (i / bufferLength) * Math.PI * 2;
          const barLen = (dataArray[i] / 255) * 70;

          const x1 = centerX + Math.cos(angle) * radius;
          const y1 = centerY + Math.sin(angle) * radius;
          const x2 = centerX + Math.cos(angle) * (radius + barLen);
          const y2 = centerY + Math.sin(angle) * (radius + barLen);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = `hsl(${(i / bufferLength) * 360}, 100%, 65%)`;
          ctx.stroke();
        }
      }
    };

    draw();
  };

  // Toggle Microphone
  const toggleMicrophone = async () => {
    if (isMicActive) {
      cleanupAudio();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      source.connect(analyser);

      setIsMicActive(true);
      startVisualizerLoop(analyser);
    } catch (err) {
      console.error('Microphone access error:', err);
      alert('Mikrofona erişilemedi. Lütfen mikrofon izinlerini kontrol edin.');
    }
  };

  // Start / Stop Microphone Recording
  const startRecording = () => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordingBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start failed:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // File Upload & Visualizer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    cleanupAudio();
    setAudioFile(file);

    const fileUrl = URL.createObjectURL(file);
    const audioEl = new Audio(fileUrl);
    audioElementRef.current = audioEl;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioCtx;

    const analyser = audioCtx.createAnalyser();
    analyserRef.current = analyser;

    const source = audioCtx.createMediaElementSource(audioEl);
    sourceNodeRef.current = source;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    audioEl.onended = () => {
      setIsFilePlaying(false);
    };

    startVisualizerLoop(analyser);
  };

  const toggleFilePlayback = () => {
    if (!audioElementRef.current || !audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (isFilePlaying) {
      audioElementRef.current.pause();
      setIsFilePlaying(false);
    } else {
      audioElementRef.current.play();
      setIsFilePlaying(true);
    }
  };

  const toggleRecordedPlayback = () => {
    if (!recordedAudioElementRef.current && recordedUrl) {
      const audioEl = new Audio(recordedUrl);
      recordedAudioElementRef.current = audioEl;
      audioEl.onended = () => setIsPlayingRecorded(false);
    }

    if (recordedAudioElementRef.current) {
      if (isPlayingRecorded) {
        recordedAudioElementRef.current.pause();
        setIsPlayingRecorded(false);
      } else {
        recordedAudioElementRef.current.play();
        setIsPlayingRecorded(true);
      }
    }
  };

  const downloadRecording = () => {
    if (!recordedUrl) return;
    const a = document.createElement('a');
    a.href = recordedUrl;
    a.download = `finora-audio-recording-${Date.now()}.webm`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <Activity className="w-3 h-3" />
          <span>WEB AUDIO API SPECTRUM</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('audio.title')} <span className="neon-text">{t('audio.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-2xl mx-auto text-sm md:text-base">
          {t('audio.desc')}
        </p>
      </div>

      {/* Main Panel */}
      <div className="glass-panel p-6 md:p-8 space-y-6">
        {/* Controls Bar: Input Mode & Style Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-finora-border pb-6">
          {/* Mode Switch */}
          <div className="flex p-1 bg-finora-border rounded-xl w-full md:w-auto">
            <button
              onClick={() => handleModeChange('mic')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'mic' ? 'bg-finora-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              {t('audio.mode_mic')}
            </button>
            <button
              onClick={() => handleModeChange('file')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all ${
                mode === 'file' ? 'bg-finora-accent text-black shadow-lg' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              {t('audio.mode_file')}
            </button>
          </div>

          {/* Visual Style Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-xs font-mono text-neutral-400 hidden sm:inline">{t('audio.visual_style')}:</span>
            <div className="flex p-1 bg-finora-border rounded-xl">
              <button
                onClick={() => setVisualStyle('bars')}
                title={t('audio.style_bars')}
                className={`p-2 rounded-lg transition-all ${visualStyle === 'bars' ? 'bg-finora-accent text-black' : 'text-neutral-400 hover:text-white'}`}
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualStyle('wave')}
                title={t('audio.style_wave')}
                className={`p-2 rounded-lg transition-all ${visualStyle === 'wave' ? 'bg-finora-accent text-black' : 'text-neutral-400 hover:text-white'}`}
              >
                <Radio className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVisualStyle('circle')}
                title={t('audio.style_circle')}
                className={`p-2 rounded-lg transition-all ${visualStyle === 'circle' ? 'bg-finora-accent text-black' : 'text-neutral-400 hover:text-white'}`}
              >
                <Circle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Visualizer Canvas Display */}
        <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-finora-border shadow-2xl bg-black">
          <canvas
            ref={canvasRef}
            width={800}
            height={320}
            className="w-full h-full block"
          />

          {!isMicActive && mode === 'mic' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-finora-accent/10 border border-finora-accent/30 flex items-center justify-center text-finora-accent animate-pulse">
                <Mic className="w-8 h-8" />
              </div>
              <p className="text-neutral-300 font-medium max-w-sm">
                Canlı ses spektrumunu ve kaydı başlatmak için mikrofonunuzu etkinleştirin.
              </p>
              <button
                onClick={toggleMicrophone}
                className="px-6 py-3 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-finora-accent/20"
              >
                <Mic className="w-4 h-4" />
                {t('audio.start_mic')}
              </button>
            </div>
          )}

          {!audioFile && mode === 'file' && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-finora-accent/10 border border-finora-accent/30 flex items-center justify-center text-finora-accent">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-neutral-300 font-medium max-w-sm">
                {t('audio.upload_prompt')}
              </p>
              <label className="cursor-pointer px-6 py-3 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-finora-accent/20">
                <Upload className="w-4 h-4" />
                <span>DOSYA SEÇ</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Mode Specific Action Controls */}
        {mode === 'mic' && isMicActive && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-finora-border/40 border border-finora-border">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMicrophone}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-mono text-xs font-bold hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <MicOff className="w-4 h-4" />
                {t('audio.stop_mic')}
              </button>

              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="px-5 py-2 bg-emerald-500 text-black rounded-xl font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                  {t('audio.start_rec')}
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-5 py-2 bg-rose-500 text-white rounded-xl font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-pulse"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  {t('audio.stop_rec')}
                </button>
              )}
            </div>

            {recordedUrl && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleRecordedPlayback}
                  className="px-4 py-2 bg-finora-accent/20 text-finora-accent border border-finora-accent/30 rounded-xl font-mono text-xs font-bold hover:bg-finora-accent/30 transition-all flex items-center gap-2"
                >
                  {isPlayingRecorded ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isPlayingRecorded ? t('audio.pause_rec') : t('audio.play_rec')}
                </button>

                <button
                  onClick={downloadRecording}
                  className="px-4 py-2 bg-finora-accent text-black rounded-xl font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('audio.download_rec')}
                </button>
              </div>
            )}
          </div>
        )}

        {mode === 'file' && audioFile && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-finora-border/40 border border-finora-border">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleFilePlayback}
                className="px-5 py-2.5 bg-finora-accent text-black rounded-xl font-mono text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-finora-accent/20"
              >
                {isFilePlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isFilePlaying ? t('audio.pause_rec') : t('audio.play_rec')}
              </button>

              <div className="text-xs font-mono text-neutral-300 truncate max-w-xs">
                🎵 {audioFile.name}
              </div>
            </div>

            <label className="cursor-pointer px-4 py-2 bg-finora-border hover:bg-neutral-800 text-neutral-300 rounded-xl font-mono text-xs transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>BAŞKA DOSYA</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Info Footer */}
        <div className="p-4 rounded-xl bg-finora-accent/5 border border-finora-accent/10 flex items-start gap-3 text-xs text-neutral-400">
          <Info className="w-4 h-4 text-finora-accent shrink-0 mt-0.5" />
          <p>{t('audio.info_text')}</p>
        </div>
      </div>
    </div>
  );
}
