import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Github, 
  Instagram, 
  Twitter, 
  Youtube, 
  Globe,
  Upload,
  ArrowRight,
  User,
  ExternalLink,
  Laptop,
  Smartphone,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ThemeType = 'glass' | 'cyberpunk' | 'minimalist' | 'brutalism' | 'synthwave' | 'matrix' | 'sakura' | 'holographic' | 'claymorphism';
type IconType = 'github' | 'instagram' | 'twitter' | 'youtube' | 'globe';

interface ProfileLink {
  title: string;
  url: string;
  icon: IconType;
}

interface ProfileState {
  name: string;
  bio: string;
  avatar: string;
  theme: ThemeType;
  links: ProfileLink[];
}

const DEFAULT_STATE: ProfileState = {
  name: "Finora Explorer",
  bio: "Creative developer & tools designer. Crafting premium digital utilities.",
  avatar: "",
  theme: "glass",
  links: [
    { title: "GitHub Profile", url: "https://github.com", icon: "github" },
    { title: "Twitter / X", url: "https://x.com", icon: "twitter" },
    { title: "Personal Website", url: "https://example.com", icon: "globe" }
  ]
};

// Robust UTF-8 Base64 encoding/decoding
const encodeState = (state: ProfileState): string => {
  try {
    const jsonStr = JSON.stringify(state);
    const bytes = new TextEncoder().encode(jsonStr);
    let binString = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    return btoa(binString);
  } catch {
    return "";
  }
};

const decodeState = (base64: string): ProfileState | null => {
  try {
    const binString = atob(base64);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
};

export default function LinkBagTool() {
  const { t, language } = useLanguage();
  
  // App States
  const [profile, setProfile] = useState<ProfileState>(DEFAULT_STATE);
  const [viewMode, setViewMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Simulator preview mode: 'mobile' or 'desktop'
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // Simulated phone OS clock time
  const [simTime, setSimTime] = useState('12:00');

  // Check URL Hash for shared profile data
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#profile=')) {
        const base64Data = hash.substring('#profile='.length);
        const decoded = decodeState(base64Data);
        if (decoded) {
          setProfile(decoded);
          setViewMode(true);
        }
      } else {
        setViewMode(false);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Update simulator device clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setSimTime(`${hrs}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle Avatar Image Upload (Base64)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert(language === 'tr' ? 'Resim boyutu 1MB\'tan küçük olmalıdır!' : 'Image size must be less than 1MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Add Link
  const addLink = () => {
    setProfile(prev => ({
      ...prev,
      links: [...prev.links, { title: "New Link", url: "https://", icon: "globe" }]
    }));
  };

  // Update Link Field
  const updateLink = (index: number, key: keyof ProfileLink, value: string) => {
    setProfile(prev => {
      const newLinks = [...prev.links];
      newLinks[index] = { ...newLinks[index], [key]: value };
      return { ...prev, links: newLinks };
    });
  };

  // Remove Link
  const removeLink = (index: number) => {
    setProfile(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  // Get share link
  const shareLink = useMemo(() => {
    const encoded = encodeState(profile);
    return `${window.location.origin}${window.location.pathname}#profile=${encoded}`;
  }, [profile]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Standalone HTML Downloader
  const handleDownloadHtml = () => {
    const htmlContent = generateStandaloneHtml(profile);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '-')}-profile.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper icons components
  const renderIcon = (type: IconType, className = "w-5 h-5") => {
    switch (type) {
      case 'github': return <Github className={className} />;
      case 'instagram': return <Instagram className={className} />;
      case 'twitter': return <Twitter className={className} />;
      case 'youtube': return <Youtube className={className} />;
      default: return <Globe className={className} />;
    }
  };

  // Style calculations for Preview / View Mode
  const themeStyles = useMemo(() => {
    switch (profile.theme) {
      case 'cyberpunk':
        return {
          wrapper: "bg-[#050505] min-h-screen text-yellow-400 font-mono py-16 px-4 relative border-8 border-yellow-400 flex flex-col items-center justify-center overflow-x-hidden",
          card: "w-full max-w-md border-2 border-yellow-400 bg-black p-8 shadow-[6px_6px_0px_#ea580c] space-y-8",
          avatar: "w-24 h-24 rounded-none border-4 border-yellow-400 mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 border-4 border-yellow-400 mx-auto flex items-center justify-center text-yellow-400",
          name: "text-2xl font-black text-center tracking-wider uppercase text-yellow-400",
          bio: "text-center text-xs text-neutral-400 leading-relaxed max-w-sm mx-auto",
          link: "border-2 border-cyan-400 bg-black text-cyan-400 hover:bg-cyan-400 hover:text-black py-4 px-6 text-center font-bold uppercase transition-all duration-200 block shadow-[4px_4px_0px_#ec4899] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] flex items-center justify-between"
        };
      case 'minimalist':
        return {
          wrapper: "bg-[#f5f5f4] min-h-screen text-stone-900 font-sans py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden",
          card: "w-full max-w-md bg-white border border-stone-200 rounded-3xl p-8 shadow-sm space-y-8",
          avatar: "w-24 h-24 rounded-full border border-stone-200 mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-stone-500",
          name: "text-xl font-bold text-center text-stone-900",
          bio: "text-center text-sm text-stone-500 leading-relaxed max-w-sm mx-auto",
          link: "bg-stone-50 border border-stone-200 text-stone-800 hover:bg-stone-100 py-3.5 px-6 rounded-2xl text-center font-semibold transition-all duration-200 block flex items-center justify-between"
        };
      case 'brutalism':
        return {
          wrapper: "bg-[#ffedd5] min-h-screen text-black font-mono py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden",
          card: "w-full max-w-md bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8",
          avatar: "w-24 h-24 rounded-none border-4 border-black mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 border-4 border-black mx-auto flex items-center justify-center text-black bg-orange-200",
          name: "text-2xl font-black text-center tracking-tight text-black",
          bio: "text-center text-sm text-black leading-relaxed font-bold max-w-sm mx-auto border-2 border-black p-3 bg-white",
          link: "bg-[#fdba74] border-4 border-black text-black py-4 px-6 rounded-none text-center font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-100 block flex items-center justify-between"
        };
      case 'synthwave':
        return {
          wrapper: "bg-gradient-to-b from-[#1a0b2e] via-[#310c4f] to-[#60124c] min-h-screen text-pink-400 font-mono py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden relative",
          card: "w-full max-w-md border border-pink-500 bg-[#0d0415]/90 p-8 shadow-[0_0_25px_rgba(236,72,153,0.35)] rounded-3xl space-y-8 z-10",
          avatar: "w-24 h-24 rounded-full border-2 border-pink-500 mx-auto object-cover shadow-[0_0_15px_rgba(236,72,153,0.5)]",
          avatarPlaceholder: "w-24 h-24 bg-black border-2 border-pink-500 rounded-full mx-auto flex items-center justify-center text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]",
          name: "text-2xl font-black text-center text-pink-400 tracking-widest uppercase",
          bio: "text-center text-xs text-[#22d3ee] leading-relaxed max-w-sm mx-auto",
          link: "bg-[#240c36] border border-pink-500 text-pink-300 hover:bg-[#ec4899] hover:text-black py-3 px-6 rounded-xl font-bold uppercase transition-all duration-200 block shadow-[0_0_10px_rgba(236,72,153,0.15)] hover:shadow-[0_0_20px_rgba(236,72,153,0.6)] flex items-center justify-between"
        };
      case 'matrix':
        return {
          wrapper: "bg-black min-h-screen text-green-500 font-mono py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden relative",
          card: "w-full max-w-md border border-green-500 bg-black/90 p-8 space-y-8 z-10 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
          avatar: "w-24 h-24 rounded-none border border-green-500 mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 border border-green-500 mx-auto flex items-center justify-center text-green-500 bg-black",
          name: "text-2xl font-black text-center text-green-500 tracking-widest",
          bio: "text-center text-xs text-green-600 leading-relaxed max-w-sm mx-auto border-t border-b border-green-900 py-2",
          link: "border border-green-500 text-green-500 hover:bg-green-500 hover:text-black py-3 px-6 transition-all duration-150 font-bold block flex items-center justify-between"
        };
      case 'sakura':
        return {
          wrapper: "bg-[#fff1f2] min-h-screen text-[#be123c] font-sans py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden",
          card: "w-full max-w-md bg-white/80 border border-[#fecdd3] text-[#be123c] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(254,205,211,0.3)] backdrop-blur-sm space-y-8",
          avatar: "w-24 h-24 rounded-full border-4 border-[#ffe4e6] mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 bg-[#fff1f2] border-4 border-[#ffe4e6] rounded-full mx-auto flex items-center justify-center text-[#be123c]",
          name: "text-2xl font-bold text-center text-[#be123c]",
          bio: "text-center text-sm text-[#e11d48] opacity-80 leading-relaxed max-w-sm mx-auto",
          link: "bg-[#ffe4e6] text-[#be123c] hover:bg-[#fecdd3] py-3.5 px-6 rounded-2xl text-center font-bold transition-all duration-200 block flex items-center justify-between"
        };
      case 'holographic':
        return {
          wrapper: "bg-gradient-to-tr from-cyan-400 via-pink-400 to-indigo-500 min-h-screen text-white font-sans py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden relative",
          card: "w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] space-y-8 z-10",
          avatar: "w-24 h-24 rounded-full border-2 border-white/30 mx-auto object-cover p-1 bg-white/10",
          avatarPlaceholder: "w-24 h-24 bg-white/5 border border-white/20 rounded-full mx-auto flex items-center justify-center text-white p-1",
          name: "text-2xl font-extrabold text-center tracking-tight text-white",
          bio: "text-center text-sm text-white/80 leading-relaxed max-w-sm mx-auto",
          link: "bg-white/25 border border-white/25 text-white hover:bg-white/35 py-3.5 px-6 rounded-2xl text-center font-bold transition-all duration-200 block flex items-center justify-between shadow-[0_4px_25px_rgba(0,0,0,0.08)]"
        };
      case 'claymorphism':
        return {
          wrapper: "bg-[#e0e7ff] min-h-screen text-[#312e81] font-sans py-16 px-4 flex flex-col items-center justify-center overflow-x-hidden",
          card: "w-full max-w-md bg-[#e0e7ff] rounded-[36px] border border-white/40 p-8 shadow-[inset_4px_4px_8px_rgba(255,255,255,0.55),inset_-4px_-4px_8px_rgba(0,0,0,0.05),12px_12px_24px_rgba(165,180,252,0.5),-12px_-12px_24px_rgba(255,255,255,0.9)] space-y-8",
          avatar: "w-24 h-24 rounded-full border border-white/40 shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5)] mx-auto object-cover",
          avatarPlaceholder: "w-24 h-24 bg-[#e0e7ff] rounded-full mx-auto flex items-center justify-center text-[#312e81] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.5)]",
          name: "text-xl font-black text-center text-[#312e81]",
          bio: "text-center text-sm text-[#4338ca] leading-relaxed max-w-sm mx-auto",
          link: "bg-[#e0e7ff] text-[#312e81] py-3.5 px-6 rounded-3xl font-extrabold transition-all duration-200 block shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.05),6px_6px_12px_rgba(165,180,252,0.6),-6px_-6px_12px_rgba(255,255,255,0.9)] hover:translate-y-[-2px] hover:shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_4px_rgba(0,0,0,0.05),8px_8px_16px_rgba(165,180,252,0.6),-8px_-8px_16px_rgba(255,255,255,0.9)] flex items-center justify-between"
        };
      default: // glassmorphism
        return {
          wrapper: "bg-finora-bg min-h-screen text-white font-sans py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden",
          card: "w-full max-w-md glass-panel backdrop-blur-md border border-white/10 p-8 shadow-2xl space-y-8 z-10",
          avatar: "w-24 h-24 rounded-full border-2 border-finora-accent/40 mx-auto object-cover p-1 bg-neutral-900",
          avatarPlaceholder: "w-24 h-24 bg-neutral-950 border border-neutral-800 rounded-full mx-auto flex items-center justify-center text-neutral-400 p-1",
          name: "text-2xl font-bold text-center text-white",
          bio: "text-center text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto",
          link: "glass-panel bg-white/5 border border-white/5 text-white hover:border-finora-accent/40 py-3.5 px-6 rounded-2xl text-center font-bold hover:scale-[1.02] transition-all duration-300 block flex items-center justify-between"
        };
    }
  }, [profile]);

  // Full screen profile viewer mode
  if (viewMode) {
    return (
      <div className={themeStyles.wrapper}>
        {/* Animated Background blur balls for glassmorphism */}
        {profile.theme === 'glass' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-finora-accent/10 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
          </>
        )}

        {/* Shifting retro sunset sun grid for Synthwave */}
        {profile.theme === 'synthwave' && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.07)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
        )}

        {/* Matrix Scan lines and glitch */}
        {profile.theme === 'matrix' && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        )}

        <div className={themeStyles.card}>
          {/* Avatar */}
          {profile.avatar ? (
            <img src={profile.avatar} alt="Avatar" className={themeStyles.avatar} />
          ) : (
            <div className={themeStyles.avatarPlaceholder}>
              <User className="w-12 h-12" />
            </div>
          )}

          {/* Profile text */}
          <div className="space-y-2">
            <h1 className={themeStyles.name}>{profile.name}</h1>
            <p className={themeStyles.bio}>{profile.bio}</p>
          </div>

          {/* Link bag */}
          <div className="space-y-4 pt-4">
            {profile.links.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url}
                target="_blank" 
                rel="noopener noreferrer" 
                className={themeStyles.link}
              >
                <span className="flex items-center gap-3">
                  {renderIcon(link.icon, "w-5 h-5 shrink-0")}
                  <span>{link.title}</span>
                </span>
                <ExternalLink className="w-4 h-4 opacity-40 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer info branding */}
        <div className="mt-12 text-[10px] font-mono opacity-40 hover:opacity-100 transition-opacity z-10 flex flex-col items-center gap-3">
          <span>Created with Finora LinkBag</span>
          <button 
            onClick={() => window.location.hash = ''}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 text-white rounded-lg hover:border-finora-accent transition-colors flex items-center gap-1.5"
          >
            <Laptop className="w-3.5 h-3.5 text-finora-accent" />
            Create Your Own
          </button>
        </div>
      </div>
    );
  }

  // Creator Page UI
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('linkbag.title')} <span className="neon-text">{t('linkbag.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('linkbag.desc')}</p>
        </div>

        {/* Workspace split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Editor */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-panel p-8 space-y-6">
              <h3 className="text-lg font-bold border-b border-finora-border pb-3 text-white uppercase tracking-wider">
                {t('linkbag.editor')}
              </h3>

              {/* Profile Config */}
              <div className="space-y-4">
                {/* Avatar picker */}
                <div className="flex items-center gap-4">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-16 h-16 rounded-xl object-cover border border-finora-border p-0.5" />
                  ) : (
                    <div className="w-16 h-16 bg-neutral-950 border border-finora-border rounded-xl flex items-center justify-center text-neutral-500">
                      <User className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-neutral-400">{t('linkbag.profile_avatar_upload')}</label>
                    <label className="cursor-pointer px-4 py-2 bg-finora-border hover:bg-neutral-800 text-white rounded-lg text-xs font-mono font-bold border border-neutral-800 transition-colors flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5" />
                      SELECT
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-neutral-400">{t('linkbag.profile_name')}</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-neutral-400">{t('linkbag.profile_bio')}</label>
                    <input
                      type="text"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-xl px-4 py-2.5 text-sm font-mono text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Picker */}
              <div className="space-y-3 pt-4 border-t border-finora-border">
                <span className="block text-xs font-mono text-neutral-400 tracking-wider uppercase">{t('linkbag.select_theme')}</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(['glass', 'cyberpunk', 'minimalist', 'brutalism', 'synthwave', 'matrix', 'sakura', 'holographic', 'claymorphism'] as ThemeType[]).map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setProfile(prev => ({ ...prev, theme }))}
                      className={`px-3 py-3.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        profile.theme === theme 
                          ? 'bg-finora-accent/20 border-finora-accent text-finora-accent shadow-glow' 
                          : 'bg-neutral-900/50 border-finora-border text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {t(`linkbag.theme_${theme}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Links Config */}
              <div className="space-y-4 pt-4 border-t border-finora-border">
                <div className="flex items-center justify-between">
                  <span className="block text-xs font-mono text-neutral-400 tracking-wider uppercase">LINKS ({profile.links.length})</span>
                  <button
                    onClick={addLink}
                    className="px-3 py-1.5 bg-finora-accent/10 border border-finora-accent/20 text-finora-accent hover:bg-finora-accent/20 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {t('linkbag.add_link')}
                  </button>
                </div>

                <div className="space-y-4">
                  {profile.links.map((link, index) => (
                    <div key={index} className="p-4 bg-neutral-900/50 rounded-xl border border-finora-border space-y-3 relative group">
                      
                      <button
                        onClick={() => removeLink(index)}
                        className="absolute right-3 top-3 text-neutral-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-neutral-500 uppercase">{t('linkbag.link_title')}</label>
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateLink(index, 'title', e.target.value)}
                            className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-neutral-500 uppercase">{t('linkbag.link_url')}</label>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => updateLink(index, 'url', e.target.value)}
                            className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-neutral-500 uppercase">{t('linkbag.link_icon')}</label>
                          <select
                            value={link.icon}
                            onChange={(e) => updateLink(index, 'icon', e.target.value as IconType)}
                            className="w-full bg-finora-bg border border-finora-border focus:border-finora-accent rounded-lg px-2.5 py-1.5 text-xs font-mono text-white outline-none"
                          >
                            <option value="globe">Global Website</option>
                            <option value="github">GitHub</option>
                            <option value="instagram">Instagram</option>
                            <option value="twitter">Twitter / X</option>
                            <option value="youtube">YouTube</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Actions panel */}
              <div className="pt-6 border-t border-finora-border flex flex-col md:flex-row gap-4">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 px-5 py-3 bg-finora-accent text-black hover:bg-opacity-90 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 neon-glow"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? t('common.copied') : t('linkbag.share_profile')}
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="flex-1 px-5 py-3 bg-finora-border hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('linkbag.download_html')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Preview / Simulator */}
          <div className="lg:col-span-5 flex flex-col items-center space-y-6">
            
            {/* Device Switcher Controls */}
            <div className="flex bg-neutral-900 border border-finora-border p-1.5 rounded-xl gap-1">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  previewDevice === 'mobile' 
                    ? 'bg-finora-accent text-black' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                MOBILE
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  previewDevice === 'desktop' 
                    ? 'bg-finora-accent text-black' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Laptop className="w-4 h-4" />
                DESKTOP
              </button>
            </div>

            {/* Simulated Simulator Container */}
            {previewDevice === 'mobile' ? (
              /* Upgraded Smartphone Simulator Frame */
              <div className="w-[330px] h-[610px] bg-black border-[12px] border-neutral-900 rounded-[44px] shadow-2xl relative overflow-hidden flex flex-col items-center p-0.5 ring-4 ring-neutral-800">
                
                {/* Smartphone Screen Glare Glass reflection overlay */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-30 transform skew-x-12" />

                {/* Simulated Phone OS Top Status Bar */}
                <div className="absolute top-0 w-full px-6 py-2 flex items-center justify-between text-[11px] font-semibold text-white/90 z-40 select-none font-mono">
                  <span>{simTime}</span>
                  {/* Dynamic camera notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-black rounded-full flex items-center justify-end pr-3">
                    <div className="w-2 h-2 bg-neutral-900 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5 text-white" />
                    <Wifi className="w-3.5 h-3.5 text-white" />
                    <Battery className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Scrollable Simulator Screen */}
                <div className={`${themeStyles.wrapper} w-full h-full pt-14 pb-8 px-4 overflow-y-auto rounded-[32px]`}>
                  {profile.theme === 'glass' && (
                    <>
                      <div className="absolute top-10 left-10 w-36 h-36 rounded-full bg-finora-accent/15 blur-[40px] pointer-events-none" />
                      <div className="absolute bottom-10 right-10 w-36 h-36 rounded-full bg-purple-500/15 blur-[40px] pointer-events-none" />
                    </>
                  )}

                  {profile.theme === 'synthwave' && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />
                  )}

                  {profile.theme === 'matrix' && (
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.08)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                  )}

                  {/* Profile simulation card */}
                  <div className={`${themeStyles.card} border p-4 space-y-6 w-full shadow-md`}>
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="Avatar" className={`${themeStyles.avatar} w-16 h-16`} />
                    ) : (
                      <div className={`${themeStyles.avatarPlaceholder} w-16 h-16`}>
                        <User className="w-8 h-8" />
                      </div>
                    )}

                    {/* Profile text */}
                    <div className="space-y-1">
                      <h4 className={`${themeStyles.name} text-base`}>{profile.name}</h4>
                      <p className={`${themeStyles.bio} text-[11px] leading-snug`}>{profile.bio}</p>
                    </div>

                    {/* Links */}
                    <div className="space-y-3 pt-2">
                      {profile.links.map((link, idx) => (
                        <a 
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${themeStyles.link} py-2.5 px-3 text-xs`}
                        >
                          <span className="flex items-center gap-2">
                            {renderIcon(link.icon, "w-4 h-4")}
                            <span className="truncate max-w-[150px]">{link.title}</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 text-[9px] font-mono opacity-40 text-center">
                    Created with Finora LinkBag
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Simulator Frame */
              <div className="w-full max-w-xl h-[420px] bg-neutral-950 border border-finora-border rounded-2xl shadow-2xl relative overflow-hidden flex flex-col">
                {/* Desktop browser header bar */}
                <div className="bg-neutral-900 border-b border-finora-border px-4 py-2.5 flex items-center gap-2 select-none shrink-0 z-20">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex-1 max-w-xs mx-auto bg-neutral-950 border border-finora-border/50 text-[10px] text-neutral-400 font-mono py-1 px-3 rounded-md text-center truncate">
                    {shareLink}
                  </div>
                </div>

                {/* Desktop Preview Area */}
                <div className="flex-1 overflow-y-auto relative p-6 bg-neutral-900">
                  <div className={`${themeStyles.wrapper} w-full min-h-0 py-8 px-2 bg-opacity-95 rounded-xl`}>
                    {profile.theme === 'glass' && (
                      <>
                        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-finora-accent/15 blur-[25px] pointer-events-none" />
                        <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-purple-500/15 blur-[25px] pointer-events-none" />
                      </>
                    )}

                    {profile.theme === 'synthwave' && (
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.04)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />
                    )}

                    {profile.theme === 'matrix' && (
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.08)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
                    )}

                    <div className={`${themeStyles.card} w-full max-w-md mx-auto p-6 space-y-6 shadow-md border`}>
                      {profile.avatar ? (
                        <img src={profile.avatar} alt="Avatar" className={`${themeStyles.avatar} w-16 h-16`} />
                      ) : (
                        <div className={`${themeStyles.avatarPlaceholder} w-16 h-16`}>
                          <User className="w-8 h-8" />
                        </div>
                      )}

                      {/* Profile info text */}
                      <div className="space-y-1">
                        <h4 className={`${themeStyles.name} text-base`}>{profile.name}</h4>
                        <p className={`${themeStyles.bio} text-[11px] leading-snug`}>{profile.bio}</p>
                      </div>

                      {/* Links */}
                      <div className="space-y-3 pt-2">
                        {profile.links.map((link, idx) => (
                          <a 
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${themeStyles.link} py-2.5 px-3 text-xs`}
                          >
                            <span className="flex items-center gap-2">
                              {renderIcon(link.icon, "w-4 h-4")}
                              <span className="truncate max-w-[200px]">{link.title}</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-30" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// Standalone HTML code generator
function generateStandaloneHtml(profile: ProfileState): string {
  const isGlass = profile.theme === 'glass';
  const isCyber = profile.theme === 'cyberpunk';
  const isMinimal = profile.theme === 'minimalist';
  const isBrutal = profile.theme === 'brutalism';
  const isSynth = profile.theme === 'synthwave';
  const isMatrix = profile.theme === 'matrix';
  const isSakura = profile.theme === 'sakura';
  const isHolo = profile.theme === 'holographic';
  const isClay = profile.theme === 'claymorphism';

  // Choose appropriate SVG icon paths
  const getSvgPath = (icon: IconType) => {
    switch (icon) {
      case 'github':
        return `<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path>`;
      case 'instagram':
        return `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>`;
      case 'twitter':
        return `<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>`;
      case 'youtube':
        return `<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"></path><polygon points="10 15 15 12 10 9"></polygon>`;
      default: // globe
        return `<circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path>`;
    }
  };

  // Generate CSS styles
  let css = "";
  if (isGlass) {
    css = `
      body { background-color: #0b0f19; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      .bg-blur { position: absolute; border-radius: 50%; filter: blur(120px); z-index: 1; pointer-events: none; }
      .bg-blur-1 { top: 15%; left: 15%; width: 250px; height: 250px; background-color: rgba(0, 242, 254, 0.15); }
      .bg-blur-2 { bottom: 15%; right: 15%; width: 250px; height: 250px; background-color: rgba(168, 85, 247, 0.15); }
      .card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.55); position: relative; z-index: 10; }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 2px solid rgba(0, 242, 254, 0.4); object-cover: cover; padding: 4px; background: #000; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; background: #0b0f19; border: 1px solid #1e293b; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #94a3b8; }
      .name { font-size: 24px; font-weight: 700; text-align: center; margin-top: 20px; color: #ffffff; }
      .bio { font-size: 14px; color: #94a3b8; text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.05); color: #fff; padding: 14px 24px; border-radius: 16px; font-weight: 700; text-decoration: none; margin-top: 16px; transition: all 0.3s ease; }
      .link:hover { border-color: rgba(0, 242, 254, 0.5); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 242, 254, 0.1); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isCyber) {
    css = `
      body { background-color: #050505; color: #facc15; font-family: "Courier New", Courier, monospace; border: 8px solid #facc15; min-height: 97vh; }
      .card { background: #000; border: 2px solid #facc15; padding: 32px; box-shadow: 6px 6px 0px #ea580c; max-width: 400px; width: 100%; margin: 0 auto; }
      .avatar { width: 96px; height: 96px; border: 4px solid #facc15; object-cover: cover; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border: 4px solid #facc15; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #facc15; background: #000; }
      .name { font-size: 22px; font-weight: 900; text-align: center; margin-top: 20px; text-transform: uppercase; tracking-wider: 0.1em; color: #facc15; }
      .bio { font-size: 12px; color: #a3a3a3; text-align: center; line-height: 1.5; margin: 8px auto 0; text-transform: uppercase; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #000; border: 2px solid #22d3ee; color: #22d3ee; padding: 14px 24px; font-weight: bold; text-decoration: none; margin-top: 16px; text-transform: uppercase; box-shadow: 4px 4px 0px #ec4899; transition: all 0.2s ease; }
      .link:hover { background: #22d3ee; color: #000; box-shadow: none; transform: translate(4px, 4px); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isMinimal) {
    css = `
      body { background-color: #f5f5f4; color: #292524; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .card { background: #fff; border: 1px solid #e7e5e4; border-radius: 28px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 1px solid #e7e5e4; object-cover: cover; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; background: #f5f5f4; border: 1px solid #e7e5e4; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #78716c; }
      .name { font-size: 20px; font-weight: 700; text-align: center; margin-top: 20px; color: #1c1917; }
      .bio { font-size: 14px; color: #78716c; text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #fafaf9; border: 1px solid #e7e5e4; color: #292524; padding: 14px 24px; border-radius: 16px; font-weight: 600; text-decoration: none; margin-top: 16px; transition: all 0.2s ease; }
      .link:hover { background: #f5f5f4; }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isBrutal) {
    css = `
      body { background-color: #ffedd5; color: #000; font-family: "Courier New", Courier, monospace; }
      .card { background: #fff; border: 4px solid #000; padding: 32px; box-shadow: 8px 8px 0px 0px rgba(0,0,0,1); }
      .avatar { width: 96px; height: 96px; border: 4px solid #000; object-cover: cover; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border: 4px solid #000; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #000; background: #fed7aa; }
      .name { font-size: 24px; font-weight: 900; text-align: center; margin-top: 20px; color: #000; }
      .bio { font-size: 14px; color: #000; text-align: center; line-height: 1.5; margin: 12px auto 0; border: 2px solid #000; padding: 12px; background: #fff; font-weight: bold; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #fdba74; border: 4px solid #000; color: #000; padding: 14px 24px; font-weight: 900; text-decoration: none; margin-top: 16px; box-shadow: 4px 4px 0px 0px rgba(0,0,0,1); transition: all 0.1s ease; }
      .link:hover { box-shadow: none; transform: translate(4px, 4px); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isSynth) {
    css = `
      body { background: linear-gradient(#1a0b2e, #310c4f, #60124c); color: #ec4899; font-family: "Courier New", Courier, monospace; }
      .grid-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(236,72,153,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.06) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
      .card { background: rgba(13, 4, 21, 0.9); border: 1px solid #ec4899; padding: 32px; border-radius: 24px; box-shadow: 0 0 25px rgba(236, 72, 153, 0.35); position: relative; z-index: 10; }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 2px solid #ec4899; object-cover: cover; margin: 0 auto; display: block; box-shadow: 0 0 15px rgba(236,72,153,0.5); }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; border: 2px solid #ec4899; background: #000; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #ec4899; box-shadow: 0 0 15px rgba(236,72,153,0.5); }
      .name { font-size: 24px; font-weight: 900; text-align: center; margin-top: 20px; color: #ec4899; letter-spacing: 0.1em; text-transform: uppercase; }
      .bio { font-size: 13px; color: #22d3ee; text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #240c36; border: 1px solid #ec4899; color: #f472b6; padding: 14px 24px; border-radius: 12px; font-weight: bold; text-decoration: none; margin-top: 16px; text-transform: uppercase; box-shadow: 0 0 10px rgba(236, 72, 153, 0.15); transition: all 0.2s ease; }
      .link:hover { background: #ec4899; color: #000; box-shadow: 0 0 20px rgba(236, 72, 153, 0.6); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isMatrix) {
    css = `
      body { background-color: #000; color: #22c55e; font-family: "Courier New", Courier, monospace; }
      .matrix-lines { position: absolute; inset: 0; background: linear-gradient(rgba(34,197,94,0.08) 50%, transparent 50%); background-size: 100% 4px; pointer-events: none; }
      .card { background: rgba(0, 0, 0, 0.95); border: 1.5px solid #22c55e; padding: 32px; box-shadow: 0 0 20px rgba(34, 197, 94, 0.15); position: relative; z-index: 10; }
      .avatar { width: 96px; height: 96px; border: 1.5px solid #22c55e; object-cover: cover; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border: 1.5px solid #22c55e; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #22c55e; background: #000; }
      .name { font-size: 22px; font-weight: 900; text-align: center; margin-top: 20px; color: #22c55e; letter-spacing: 0.15em; }
      .bio { font-size: 12px; color: #16a34a; text-align: center; line-height: 1.6; max-width: 320px; margin: 12px auto 0; border-top: 1px solid #166534; border-bottom: 1px solid #166534; padding: 8px 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #000; border: 1px solid #22c55e; color: #22c55e; padding: 14px 24px; font-weight: bold; text-decoration: none; margin-top: 16px; transition: all 0.15s ease; }
      .link:hover { background: #22c55e; color: #000; }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isSakura) {
    css = `
      body { background-color: #fff1f2; color: #be123c; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .card { background: rgba(255, 255, 255, 0.85); border: 1px solid #fecdd3; border-radius: 32px; padding: 32px; box-shadow: 0 8px 30px rgba(254, 205, 211, 0.3); backdrop-filter: blur(8px); }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 4px solid #ffe4e6; object-cover: cover; margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; border: 4px solid #ffe4e6; background: #fff1f2; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #be123c; }
      .name { font-size: 24px; font-weight: 700; text-align: center; margin-top: 20px; color: #be123c; }
      .bio { font-size: 14px; color: #e11d48; text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; opacity: 0.8; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #ffe4e6; color: #be123c; padding: 14px 24px; border-radius: 18px; font-weight: bold; text-decoration: none; margin-top: 16px; transition: all 0.2s ease; }
      .link:hover { background: #fecdd3; }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else if (isHolo) {
    css = `
      body { background: linear-gradient(45deg, #22d3ee, #f472b6, #6366f1); color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .card { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 24px; padding: 32px; box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: relative; z-index: 10; }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 2px solid rgba(255, 255, 255, 0.3); object-cover: cover; padding: 4px; background: rgba(255, 255, 255, 0.1); margin: 0 auto; display: block; }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #fff; }
      .name { font-size: 24px; font-weight: 800; text-align: center; margin-top: 20px; color: #fff; letter-spacing: -0.02em; }
      .bio { font-size: 14px; color: rgba(255, 255, 255, 0.85); text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; padding: 14px 24px; border-radius: 16px; font-weight: bold; text-decoration: none; margin-top: 16px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); transition: all 0.2s ease; }
      .link:hover { background: rgba(255, 255, 255, 0.3); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  } else { // Claymorphism
    css = `
      body { background-color: #e0e7ff; color: #312e81; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .card { background: #e0e7ff; border: 1px solid rgba(255,255,255,0.4); border-radius: 36px; padding: 32px; box-shadow: inset 4px 4px 8px rgba(255, 255, 255, 0.55), inset -4px -4px 8px rgba(0, 0, 0, 0.05), 12px 12px 24px rgba(165, 180, 252, 0.5), -12px -12px 24px rgba(255, 255, 255, 0.9); }
      .avatar { width: 96px; height: 96px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.4); object-cover: cover; margin: 0 auto; display: block; box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.5); }
      .avatar-placeholder { width: 96px; height: 96px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; color: #312e81; background: #e0e7ff; box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.5); }
      .name { font-size: 20px; font-weight: 900; text-align: center; margin-top: 20px; color: #312e81; }
      .bio { font-size: 14px; color: #4338ca; text-align: center; line-height: 1.6; max-width: 320px; margin: 8px auto 0; }
      .link { display: flex; justify-content: space-between; align-items: center; background: #e0e7ff; color: #312e81; padding: 14px 24px; border-radius: 24px; font-weight: 800; text-decoration: none; margin-top: 16px; box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.05), 6px 6px 12px rgba(165, 180, 252, 0.6), -6px -6px 12px rgba(255, 255, 255, 0.9); transition: all 0.2s ease; }
      .link:hover { transform: translateY(-2px); box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.6), inset -2px -2px 4px rgba(0, 0, 0, 0.05), 8px 8px 16px rgba(165, 180, 252, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.9); }
      .icon { width: 20px; height: 20px; margin-right: 12px; }
    `;
  }

  // Links HTML content
  const linksHtml = profile.links.map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link">
      <span style="display: flex; align-items: center;">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          ${getSvgPath(link.icon)}
        </svg>
        ${link.title}
      </span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  `).join('');

  // Avatar HTML
  const avatarHtml = profile.avatar 
    ? `<img src="${profile.avatar}" class="avatar" alt="Avatar" />`
    : `<div class="avatar-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
       </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${profile.name} - Profile</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      overflow-x: hidden;
      position: relative;
    }
    .wrapper {
      width: 100%;
      max-width: 400px;
      margin: auto;
    }
    .footer {
      margin-top: 32px;
      font-size: 11px;
      font-family: monospace;
      opacity: 0.5;
      text-align: center;
    }
    ${css}
  </style>
</head>
<body>
  ${isGlass ? '<div class="bg-blur bg-blur-1"></div><div class="bg-blur bg-blur-2"></div>' : ''}
  ${isSynth ? '<div class="grid-lines"></div>' : ''}
  ${isMatrix ? '<div class="matrix-lines"></div>' : ''}
  <div class="wrapper">
    <div class="card">
      ${avatarHtml}
      <h1 class="name">${profile.name}</h1>
      <p class="bio">${profile.bio}</p>
      <div style="margin-top: 24px;">
        ${linksHtml}
      </div>
    </div>
    <div class="footer">
      Generated with Finora LinkBag
    </div>
  </div>
</body>
</html>`;
}
