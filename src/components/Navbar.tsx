import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, ChevronDown, Image as ImageIcon, Terminal, Binary, Lock, Radio, Palette, Languages, CheckCircle2, Layout, Braces } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t('nav.home') || 'Ana Sayfa', path: '/' },
  ];

  const tools = [
    { name: t('nav.image_analysis'), path: '/tools/image-analysis', icon: <ImageIcon className="w-4 h-4" /> },
    { name: t('nav.binary_converter'), path: '/tools/binary', icon: <Binary className="w-4 h-4" /> },
    { name: t('nav.password_generator'), path: '/tools/password', icon: <Lock className="w-4 h-4" /> },
    { name: t('nav.morse_converter'), path: '/tools/morse', icon: <Radio className="w-4 h-4" /> },
    { name: t('nav.color_explorer'), path: '/tools/color', icon: <Palette className="w-4 h-4" /> },
    { name: t('nav.favicon_generator'), path: '/tools/favicon', icon: <Layout className="w-4 h-4" /> },
    { name: t('nav.json_converter'), path: '/tools/json-converter', icon: <Braces className="w-4 h-4" /> },
    { name: t('nav.ascii_art'), path: '/tools/ascii-art', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <nav className="border-b border-finora-border bg-finora-bg/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-finora-accent rounded-lg flex items-center justify-center neon-glow group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-black" />
          </div>
          <h1 className="font-mono font-bold text-xl tracking-tighter">
            {t('nav.title')} <span className="neon-text">{t('nav.title_accent')}</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-finora-accent",
                location.pathname === link.path ? "text-finora-accent" : "text-neutral-400"
              )}
            >
              {link.name}
            </Link>
          ))}

          {/* Tools Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setIsToolsOpen(true)}
            onMouseLeave={() => setIsToolsOpen(false)}
          >
            <Link
              to="/tools"
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-finora-accent",
                location.pathname === '/tools' ? "text-finora-accent" : "text-neutral-400"
              )}
            >
              {t('nav.tools')}
              <ChevronDown className={cn("w-4 h-4 transition-transform", isToolsOpen && "rotate-180")} />
            </Link>

            <AnimatePresence>
              {isToolsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setIsToolsOpen(true)}
                  onMouseLeave={() => setIsToolsOpen(false)}
                  className="absolute top-full right-0 pt-2 w-64"
                >
                  <div className="glass-panel p-2 shadow-2xl border-finora-accent/10">
                    {tools.map((tool) => (
                      <Link
                        key={tool.path}
                        to={tool.path}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-finora-accent/10 hover:text-finora-accent transition-all group"
                      >
                        <div className="w-8 h-8 bg-finora-border rounded-lg flex items-center justify-center group-hover:bg-finora-accent group-hover:text-black transition-colors">
                          {tool.icon}
                        </div>
                        <span className="text-sm font-medium">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px bg-finora-border" />

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-finora-border hover:bg-neutral-800 transition-all text-xs font-mono"
            >
              <Languages className="w-3 h-3 text-finora-accent" />
              <span className="uppercase">{language}</span>
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 pt-2 w-32"
                >
                  <div className="glass-panel p-1 shadow-2xl border-finora-accent/10">
                    <button
                      onClick={() => { setLanguage('tr'); setIsLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all",
                        language === 'tr' ? "bg-finora-accent text-black" : "hover:bg-white/5 text-neutral-400"
                      )}
                    >
                      TÜRKÇE
                      {language === 'tr' && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setIsLangOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all",
                        language === 'en' ? "bg-finora-accent text-black" : "hover:bg-white/5 text-neutral-400"
                      )}
                    >
                      ENGLISH
                      {language === 'en' && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-4 w-px bg-finora-border" />

          <div className="flex items-center gap-4 text-[10px] font-mono opacity-50">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" /> v1.0.4
            </span>
            <div className="w-1 h-1 rounded-full bg-finora-accent animate-pulse" />
            <span>SYSTEM READY</span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-neutral-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-finora-border bg-finora-bg overflow-y-auto max-h-[calc(100vh-64px)]"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-bold"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/tools"
                onClick={() => setIsOpen(false)}
                className="block text-lg font-bold"
              >
                {t('nav.tools')}
              </Link>
              <div className="pt-4 border-t border-finora-border">
                <div className="space-y-2">
                  {tools.map((tool) => (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 p-3 bg-finora-border rounded-xl"
                    >
                      {tool.icon}
                      <span className="font-medium">{tool.name}</span>
                    </Link>
                  ))}
                </div>
                <div className="pt-4 border-t border-finora-border">
                  <p className="text-xs font-mono text-neutral-500 uppercase mb-4">Language / Dil</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setLanguage('tr'); setIsOpen(false); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-mono text-sm transition-all",
                        language === 'tr' ? "bg-finora-accent text-black" : "bg-finora-border text-neutral-400"
                      )}
                    >
                      TR
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setIsOpen(false); }}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-mono text-sm transition-all",
                        language === 'en' ? "bg-finora-accent text-black" : "bg-finora-border text-neutral-400"
                      )}
                    >
                      EN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
