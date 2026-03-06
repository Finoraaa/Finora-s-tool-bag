import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Github, 
  Instagram, 
  Twitter, 
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  Shield,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-6">
            <Sparkles className="w-3 h-3" />
            <span>{t('home.badge')}</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8">
            {t('home.title')} <br />
            <span className="neon-text">{t('home.title_accent')}</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-lg mb-10 leading-relaxed">
            {t('home.description')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/tools"
              className="px-8 py-4 bg-finora-accent text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-all neon-glow"
            >
              {t('home.cta_start')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="flex items-center gap-4 px-4">
              <a 
                href="https://github.com/Finoraaa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-finora-border rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
                title={t('home.cta_github')}
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/__finora__/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-finora-border rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://x.com/Furkan_Denizzz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-finora-border rounded-xl hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="aspect-square glass-panel p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-finora-accent/10 to-transparent opacity-50" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-finora-accent rounded-xl flex items-center justify-center neon-glow">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <div className="text-right font-mono text-[10px] opacity-40">
                  SYSTEM_CORE_V1.0.4 <br />
                  STATUS: OPERATIONAL
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="h-2 w-2/3 bg-finora-border rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-finora-accent"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div className="h-2 w-1/2 bg-finora-border rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-finora-accent"
                    animate={{ width: ['0%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <ImageIcon className="w-5 h-5 text-finora-accent mb-2" />
                  <div className="text-[10px] uppercase font-mono opacity-40">{t('nav.image_analysis')}</div>
                  <div className="font-bold">ACTIVE</div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <Cpu className="w-5 h-5 text-finora-accent mb-2" />
                  <div className="text-[10px] uppercase font-mono opacity-40">AI Engine</div>
                  <div className="font-bold">GEMINI 3.1</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-finora-accent/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-finora-accent/10 rounded-full blur-[100px]" />
        </motion.div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
        {[
          {
            icon: <Shield className="w-6 h-6" />,
            title: t('home.feature_secure'),
            desc: t('home.feature_secure_desc')
          },
          {
            icon: <Zap className="w-6 h-6" />,
            title: t('home.feature_fast'),
            desc: t('home.feature_fast_desc')
          },
          {
            icon: <Sparkles className="w-6 h-6" />,
            title: t('home.feature_modern'),
            desc: t('home.feature_modern_desc')
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-8 hover:border-finora-accent/30 transition-colors group"
          >
            <div className="w-12 h-12 bg-finora-border rounded-xl flex items-center justify-center mb-6 group-hover:bg-finora-accent group-hover:text-black transition-all">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
