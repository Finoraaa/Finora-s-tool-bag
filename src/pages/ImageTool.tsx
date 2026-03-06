import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Tag, 
  Zap, 
  RefreshCw, 
  Download, 
  Info,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeImage, AnalysisResult } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ImageTool() {
  const { t } = useLanguage();
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFormat, setSelectedFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/webp');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError(t('image.error_invalid') || 'Lütfen geçerli bir görsel dosyası yükleyin.');
      return;
    }

    setError(null);
    setResult(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const analysisResult = await analyzeImage(image, mimeType);
      setResult(analysisResult);
    } catch (err: any) {
      setError(err.message || t('image.error_generic') || 'Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = () => {
    if (!image) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const extension = selectedFormat.split('/')[1];
      const fileName = result?.seo_filename.split('.')[0] || 'finora-optimized';
      const dataUrl = canvas.toDataURL(selectedFormat, 0.9);
      
      const link = document.createElement('a');
      link.download = `${fileName}.${extension}`;
      link.href = dataUrl;
      link.click();
    };

    img.src = image;
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setSelectedFormat('image/webp');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-7 space-y-6">
          <section className="glass-panel p-1 overflow-hidden">
            {!image ? (
              <div 
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-finora-border rounded-xl cursor-pointer hover:border-finora-accent/50 hover:bg-finora-accent/5 transition-all group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="w-16 h-16 bg-finora-border rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-neutral-400 group-hover:text-finora-accent" />
                </div>
                <p className="text-lg font-medium mb-1">{t('image.drop')}</p>
                <p className="text-sm text-neutral-500">PNG, JPG, WebP (Maks. 10MB)</p>
              </div>
            ) : (
              <div className="relative group">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full aspect-video object-contain bg-black/40 rounded-xl"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 rounded-xl">
                  <button 
                    onClick={reset}
                    className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors"
                    title={t('common.clear')}
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </section>

          {image && !result && !isAnalyzing && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleAnalyze}
              className="w-full py-4 bg-finora-accent text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all neon-glow"
            >
              <Sparkles className="w-5 h-5" />
              {t('image.analyzing').toUpperCase()}
            </motion.button>
          )}

          {isAnalyzing && (
            <div className="glass-panel p-8 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-finora-accent/20 border-t-finora-accent rounded-full animate-spin" />
                <Zap className="w-5 h-5 text-finora-accent absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-mono text-finora-accent mb-1 animate-pulse">ANALYZING DATA...</p>
                <p className="text-sm text-neutral-500">{t('image.analyzing_desc') || 'Finora is analyzing the image...'}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center opacity-40 border-dashed"
              >
                <div className="w-16 h-16 bg-finora-border rounded-2xl flex items-center justify-center mb-6">
                  <Info className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('image.waiting')}</h3>
                <p className="text-sm max-w-[280px]">
                  {t('image.waiting_desc')}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Finora's Note */}
                <section className="bg-finora-accent/10 border border-finora-accent/20 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-12 h-12 text-finora-accent" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-finora-accent flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-black">F</span>
                    </div>
                    <div>
                      <h4 className="font-mono text-xs text-finora-accent uppercase tracking-widest mb-1">{t('image.note')}</h4>
                      <p className="text-neutral-200 italic leading-relaxed">
                        "{result.finora_note}"
                      </p>
                    </div>
                  </div>
                </section>

                {/* Core Analysis */}
                <section className="glass-panel p-6 space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-finora-accent mb-3">
                      <ImageIcon className="w-4 h-4" />
                      <h4 className="font-mono text-xs uppercase tracking-widest">{t('image.summary')}</h4>
                    </div>
                    <p className="text-neutral-300 leading-relaxed">
                      {result.analysis}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-400 mb-2">
                        <RefreshCw className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-mono">{t('image.suggested_format')}</span>
                      </div>
                      <p className="font-bold text-finora-accent">{result.suggested_format}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-neutral-400 mb-2">
                        <Download className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-mono">{t('image.seo_filename')}</span>
                      </div>
                      <p className="font-mono text-xs truncate" title={result.seo_filename}>
                        {result.seo_filename}
                      </p>
                    </div>
                  </div>

                  {/* Download Section */}
                  <div className="pt-4 border-t border-finora-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Download className="w-4 h-4" />
                        <h4 className="font-mono text-[10px] uppercase tracking-widest">{t('image.download_options')}</h4>
                      </div>
                      <div className="flex bg-finora-border p-1 rounded-lg">
                        {(['image/jpeg', 'image/png', 'image/webp'] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setSelectedFormat(fmt)}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              selectedFormat === fmt 
                                ? "bg-finora-accent text-black" 
                                : "text-neutral-500 hover:text-neutral-300"
                            )}
                          >
                            {fmt.split('/')[1].toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleDownload}
                      className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-finora-accent transition-colors neon-glow"
                    >
                      <Download className="w-4 h-4" />
                      {t('image.download_as')} {selectedFormat.split('/')[1].toUpperCase()}
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-neutral-400 mb-3">
                      <Tag className="w-4 h-4" />
                      <h4 className="font-mono text-[10px] uppercase tracking-widest">{t('image.tags')}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.tags.map((tag, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-finora-border text-neutral-400 text-xs rounded-full border border-white/5 hover:border-finora-accent/30 transition-colors cursor-default"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Actions */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      const text = `Analiz: ${result.analysis}\nFormat: ${result.suggested_format}\nSEO Adı: ${result.seo_filename}\nEtiketler: ${result.tags.join(', ')}`;
                      navigator.clipboard.writeText(text);
                    }}
                    className="flex-1 py-3 bg-finora-border hover:bg-neutral-800 text-neutral-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {t('common.copy')}
                  </button>
                  <button 
                    onClick={reset}
                    className="px-6 py-3 border border-finora-border hover:bg-white/5 text-neutral-400 rounded-xl transition-colors"
                  >
                    {t('image.new_analysis')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
