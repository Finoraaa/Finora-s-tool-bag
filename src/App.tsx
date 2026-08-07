import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ImageTool from './pages/ImageTool';
import BinaryTool from './pages/BinaryTool';
import PasswordTool from './pages/PasswordTool';
import MorseTool from './pages/MorseTool';
import ColorTool from './pages/ColorTool';
import FaviconTool from './pages/FaviconTool';
import JsonConverterTool from './pages/JsonConverterTool';
import AsciiArtTool from './pages/AsciiArtTool';
import QrCodeTool from './pages/QrCodeTool';
import PomodoroTool from './pages/PomodoroTool';
import WordCounterTool from './pages/WordCounterTool';
import UnixTimestampTool from './pages/UnixTimestampTool';
import UrlShortenerTool from './pages/UrlShortenerTool';
import LinkBagTool from './pages/LinkBagTool';
import CipherTool from './pages/CipherTool';
import FileShareTool from './pages/FileShareTool';
import AudioVisualizerTool from './pages/AudioVisualizerTool';
import DecisionMakerTool from './pages/DecisionMakerTool';
import TypingTestTool from './pages/TypingTestTool';
import AtmosphereMixerTool from './pages/AtmosphereMixerTool';
import PixelArtTool from './pages/PixelArtTool';
import ReactionTestTool from './pages/ReactionTestTool';
import Tools from './pages/Tools';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-finora-bg text-neutral-200 selection:bg-finora-accent selection:text-black">
        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tools/typing-test" element={<TypingTestTool />} />
            <Route path="/tools/atmosphere-mixer" element={<AtmosphereMixerTool />} />
            <Route path="/tools/pixel-art" element={<PixelArtTool />} />
            <Route path="/tools/reaction-test" element={<ReactionTestTool />} />
            <Route path="/tools/audio-visualizer" element={<AudioVisualizerTool />} />
            <Route path="/tools/decision-maker" element={<DecisionMakerTool />} />
            <Route path="/tools/file-share" element={<FileShareTool />} />
            <Route path="/tools/image-analysis" element={<ImageTool />} />
            <Route path="/tools/binary" element={<BinaryTool />} />
            <Route path="/tools/password" element={<PasswordTool />} />
            <Route path="/tools/morse" element={<MorseTool />} />
            <Route path="/tools/color" element={<ColorTool />} />
            <Route path="/tools/favicon" element={<FaviconTool />} />
            <Route path="/tools/json-converter" element={<JsonConverterTool />} />
            <Route path="/tools/ascii-art" element={<AsciiArtTool />} />
            <Route path="/tools/qr-code" element={<QrCodeTool />} />
            <Route path="/tools/pomodoro" element={<PomodoroTool />} />
            <Route path="/tools/word-counter" element={<WordCounterTool />} />
            <Route path="/tools/unix-timestamp" element={<UnixTimestampTool />} />
            <Route path="/tools/url-shortener" element={<UrlShortenerTool />} />
            <Route path="/tools/linkbag" element={<LinkBagTool />} />
            <Route path="/tools/cipher" element={<CipherTool />} />
            <Route path="/tools" element={<Tools />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-finora-border mt-12 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 text-xs font-mono">
          <div className="flex flex-col gap-2">
            <p>© 2026 Finora's Tool Bag. All systems operational.</p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/__finora__/" target="_blank" rel="noopener noreferrer" className="hover:text-finora-accent transition-colors">INSTAGRAM</a>
              <a href="https://github.com/Finoraaa" target="_blank" rel="noopener noreferrer" className="hover:text-finora-accent transition-colors">GITHUB</a>
              <a href="https://x.com/Furkan_Denizzz" target="_blank" rel="noopener noreferrer" className="hover:text-finora-accent transition-colors">X (TWITTER)</a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-finora-accent transition-colors">DOCUMENTATION</a>
            <a href="#" className="hover:text-finora-accent transition-colors">API STATUS</a>
            <a href="#" className="hover:text-finora-accent transition-colors">PRIVACY</a>
          </div>
        </footer>
      </div>
    </Router>
  );
}
