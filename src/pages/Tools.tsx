import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Binary, 
  Lock, 
  Radio, 
  Palette, 
  Layout, 
  Braces, 
  Terminal,
  ChevronRight,
  Zap,
  QrCode,
  Timer,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Tools() {
  const { t } = useLanguage();

  const tools = [
    { 
      name: t('nav.image_analysis'), 
      path: '/tools/image-analysis', 
      icon: <ImageIcon className="w-6 h-6" />,
      desc: t('image.desc'),
      color: 'from-blue-500/20 to-cyan-500/20'
    },
    { 
      name: t('nav.binary_converter'), 
      path: '/tools/binary', 
      icon: <Binary className="w-6 h-6" />,
      desc: t('binary.desc'),
      color: 'from-emerald-500/20 to-teal-500/20'
    },
    { 
      name: t('nav.password_generator'), 
      path: '/tools/password', 
      icon: <Lock className="w-6 h-6" />,
      desc: t('password.desc'),
      color: 'from-orange-500/20 to-red-500/20'
    },
    { 
      name: t('nav.morse_converter'), 
      path: '/tools/morse', 
      icon: <Radio className="w-6 h-6" />,
      desc: t('morse.desc'),
      color: 'from-purple-500/20 to-pink-500/20'
    },
    { 
      name: t('nav.color_explorer'), 
      path: '/tools/color', 
      icon: <Palette className="w-6 h-6" />,
      desc: t('color.desc'),
      color: 'from-yellow-500/20 to-amber-500/20'
    },
    { 
      name: t('nav.favicon_generator'), 
      path: '/tools/favicon', 
      icon: <Layout className="w-6 h-6" />,
      desc: t('favicon.desc'),
      color: 'from-indigo-500/20 to-blue-500/20'
    },
    { 
      name: t('nav.json_converter'), 
      path: '/tools/json-converter', 
      icon: <Braces className="w-6 h-6" />,
      desc: t('json.desc'),
      color: 'from-rose-500/20 to-pink-500/20'
    },
    { 
      name: t('nav.ascii_art'), 
      path: '/tools/ascii-art', 
      icon: <Terminal className="w-6 h-6" />,
      desc: t('ascii.desc'),
      color: 'from-green-500/20 to-emerald-500/20'
    },
    { 
      name: t('nav.qr_code'), 
      path: '/tools/qr-code', 
      icon: <QrCode className="w-6 h-6" />,
      desc: t('qr.desc'),
      color: 'from-slate-500/20 to-zinc-500/20'
    },
    { 
      name: t('nav.pomodoro'), 
      path: '/tools/pomodoro', 
      icon: <Timer className="w-6 h-6" />,
      desc: t('pomodoro.desc'),
      color: 'from-red-500/20 to-orange-500/20'
    },
    { 
      name: t('nav.word_counter'), 
      path: '/tools/word-counter', 
      icon: <FileText className="w-6 h-6" />,
      desc: t('wordcounter.desc'),
      color: 'from-cyan-500/20 to-sky-500/20'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono">
            <Zap className="w-3 h-3" />
            <span>{t('home.badge')}</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tighter">
            {t('tools.title')} <span className="neon-text">{t('tools.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            {t('home.description')}
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link 
                to={tool.path}
                className="group block glass-panel p-8 h-full hover:border-finora-accent/40 transition-all relative overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 bg-finora-border rounded-2xl flex items-center justify-center group-hover:bg-finora-accent group-hover:text-black transition-all duration-300">
                    {tool.icon}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-finora-accent transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-finora-accent opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    <span>{t('tools.launch')}</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
