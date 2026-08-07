import React, { useState, useRef, useEffect } from 'react';
import { Palette, Edit3, PaintBucket, Eraser, Trash2, Download, Grid } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ToolMode = 'pencil' | 'bucket' | 'eraser';

const COLOR_PALETTE = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#78350f'
];

export default function PixelArtTool() {
  const { t } = useLanguage();

  const [gridSize, setGridSize] = useState<number>(16); // 8, 16, 32
  const [selectedColor, setSelectedColor] = useState<string>('#ec4899');
  const [currentTool, setCurrentTool] = useState<ToolMode>('pencil');
  const [pixels, setPixels] = useState<string[]>(new Array(16 * 16).fill('#0f172a'));
  const [isMouseDown, setIsMouseDown] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Re-initialize pixels grid on grid size change
  useEffect(() => {
    setPixels(new Array(gridSize * gridSize).fill('#0f172a'));
  }, [gridSize]);

  // Handle Pixel Click / Paint
  const paintPixel = (index: number) => {
    setPixels(prev => {
      const updated = [...prev];
      if (currentTool === 'pencil') {
        updated[index] = selectedColor;
      } else if (currentTool === 'eraser') {
        updated[index] = '#0f172a';
      } else if (currentTool === 'bucket') {
        const targetColor = prev[index];
        const floodFill = (idx: number) => {
          if (idx < 0 || idx >= gridSize * gridSize) return;
          if (updated[idx] !== targetColor || updated[idx] === selectedColor) return;
          updated[idx] = selectedColor;

          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;

          if (col > 0) floodFill(idx - 1);
          if (col < gridSize - 1) floodFill(idx + 1);
          if (row > 0) floodFill(idx - gridSize);
          if (row < gridSize - 1) floodFill(idx + gridSize);
        };
        floodFill(index);
      }
      return updated;
    });
  };

  const handleMouseDown = (index: number) => {
    setIsMouseDown(true);
    paintPixel(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isMouseDown && currentTool !== 'bucket') {
      paintPixel(index);
    }
  };

  const clearCanvas = () => {
    setPixels(new Array(gridSize * gridSize).fill('#0f172a'));
  };

  // Export Canvas to PNG
  const exportPNG = () => {
    const exportCanvas = document.createElement('canvas');
    const scale = 32; // Export high res
    exportCanvas.width = gridSize * scale;
    exportCanvas.height = gridSize * scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    pixels.forEach((color, i) => {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      ctx.fillStyle = color === '#0f172a' ? 'rgba(0,0,0,0)' : color;
      ctx.fillRect(col * scale, row * scale, scale, scale);
    });

    const link = document.createElement('a');
    link.download = `finora-pixel-art-${gridSize}x${gridSize}-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
          <Palette className="w-3 h-3" />
          <span>RETRO PIXEL ART CANVAS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
          {t('pixel.title')} <span className="neon-text">{t('pixel.title_accent')}</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm">
          {t('pixel.desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canvas Area */}
        <div className="lg:col-span-8 glass-panel p-6 flex flex-col items-center justify-center space-y-6">
          <div
            onMouseLeave={() => setIsMouseDown(false)}
            onMouseUp={() => setIsMouseDown(false)}
            className="grid border border-finora-border rounded-2xl overflow-hidden shadow-2xl bg-[#0f172a] select-none"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              width: '100%',
              maxWidth: '420px',
              aspectRatio: '1/1'
            }}
          >
            {pixels.map((color, idx) => (
              <div
                key={idx}
                onMouseDown={() => handleMouseDown(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                style={{ backgroundColor: color }}
                className="border-[0.5px] border-white/5 hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Toolbar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Grid Size Selector */}
          <div className="glass-panel p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase">{t('pixel.size')}</span>
            <div className="flex p-1 bg-finora-border rounded-xl">
              {[8, 16, 32].map(size => (
                <button
                  key={size}
                  onClick={() => setGridSize(size)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                    gridSize === size ? 'bg-finora-accent text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Selector */}
          <div className="glass-panel p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase">ARAÇLAR</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setCurrentTool('pencil')}
                className={`p-3 rounded-xl border font-mono text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  currentTool === 'pencil' ? 'bg-finora-accent/20 border-finora-accent text-finora-accent' : 'bg-finora-border/40 border-finora-border text-neutral-400'
                }`}
              >
                <Edit3 className="w-5 h-5" />
                <span>{t('pixel.pencil')}</span>
              </button>

              <button
                onClick={() => setCurrentTool('bucket')}
                className={`p-3 rounded-xl border font-mono text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  currentTool === 'bucket' ? 'bg-finora-accent/20 border-finora-accent text-finora-accent' : 'bg-finora-border/40 border-finora-border text-neutral-400'
                }`}
              >
                <PaintBucket className="w-5 h-5" />
                <span>{t('pixel.bucket')}</span>
              </button>

              <button
                onClick={() => setCurrentTool('eraser')}
                className={`p-3 rounded-xl border font-mono text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                  currentTool === 'eraser' ? 'bg-finora-accent/20 border-finora-accent text-finora-accent' : 'bg-finora-border/40 border-finora-border text-neutral-400'
                }`}
              >
                <Eraser className="w-5 h-5" />
                <span>{t('pixel.eraser')}</span>
              </button>
            </div>
          </div>

          {/* Color Picker Palette */}
          <div className="glass-panel p-6 space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase">RENK PALETİ</span>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => { setSelectedColor(color); setCurrentTool('pencil'); }}
                  style={{ backgroundColor: color }}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    selectedColor === color ? 'scale-110 border-white shadow-lg' : 'border-transparent'
                  }`}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={e => { setSelectedColor(e.target.value); setCurrentTool('pencil'); }}
              className="w-full h-10 mt-2 rounded-xl cursor-pointer bg-finora-border border-0"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={exportPNG}
              className="w-full py-3.5 bg-finora-accent text-black font-mono font-bold text-xs rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-finora-accent/20"
            >
              <Download className="w-4 h-4" />
              <span>{t('pixel.export_png')}</span>
            </button>

            <button
              onClick={clearCanvas}
              className="w-full py-3 bg-finora-border hover:bg-rose-500/20 hover:text-rose-400 text-neutral-400 font-mono font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('pixel.clear')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
