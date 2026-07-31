import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  ArrowRightLeft, 
  Copy, 
  Trash2, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  Key,
  Sliders,
  KeyRound,
  Cpu,
  Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Alphabets for Turkish (29) and Latin (26)
const TURKISH_UPPER = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
const TURKISH_LOWER = 'abcçdefgğhıijklmnoöprsştuüvyz';
const LATIN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LATIN_LOWER = 'abcdefghijklmnopqrstuvwxyz';

type Algorithm = 'caesar' | 'vigenere' | 'rot13' | 'atbash' | 'base64' | 'sha256' | 'sha1';

// Caesar Cipher algorithm
function caesarShift(text: string, shift: number, mode: 'encrypt' | 'decrypt', alphabetType: 'turkish' | 'latin'): string {
  if (alphabetType === 'turkish') {
    const len = TURKISH_UPPER.length; // 29
    const actualShift = mode === 'encrypt' ? (shift % len + len) % len : (-shift % len + len) % len;
    
    return text.split('').map(char => {
      const uIdx = TURKISH_UPPER.indexOf(char);
      if (uIdx !== -1) {
        return TURKISH_UPPER[(uIdx + actualShift) % len];
      }
      const lIdx = TURKISH_LOWER.indexOf(char);
      if (lIdx !== -1) {
        return TURKISH_LOWER[(lIdx + actualShift) % len];
      }
      return char;
    }).join('');
  }

  const len = 26;
  const actualShift = mode === 'encrypt' ? (shift % len + len) % len : (-shift % len + len) % len;
  return text.split('').map(char => {
    const uIdx = LATIN_UPPER.indexOf(char);
    if (uIdx !== -1) {
      return LATIN_UPPER[(uIdx + actualShift) % len];
    }
    const lIdx = LATIN_LOWER.indexOf(char);
    if (lIdx !== -1) {
      return LATIN_LOWER[(lIdx + actualShift) % len];
    }
    return char;
  }).join('');
}

// Vigenère Cipher algorithm
function vigenereCipher(text: string, keyword: string, mode: 'encrypt' | 'decrypt', alphabetType: 'turkish' | 'latin'): string {
  if (!keyword) return text;
  
  if (alphabetType === 'turkish') {
    const len = TURKISH_UPPER.length;
    const keyShifts = keyword.split('').map(kChar => {
      const uIdx = TURKISH_UPPER.indexOf(kChar);
      if (uIdx !== -1) return uIdx;
      const lIdx = TURKISH_LOWER.indexOf(kChar);
      if (lIdx !== -1) return lIdx;
      return -1;
    }).filter(shift => shift !== -1);

    if (keyShifts.length === 0) return text;

    let keyIdx = 0;
    return text.split('').map(char => {
      const uIdx = TURKISH_UPPER.indexOf(char);
      const lIdx = TURKISH_LOWER.indexOf(char);

      if (uIdx === -1 && lIdx === -1) {
        return char;
      }

      const currentShift = keyShifts[keyIdx % keyShifts.length];
      const actualShift = mode === 'encrypt' ? currentShift : (len - currentShift) % len;
      keyIdx++;

      if (uIdx !== -1) {
        return TURKISH_UPPER[(uIdx + actualShift) % len];
      } else {
        return TURKISH_LOWER[(lIdx + actualShift) % len];
      }
    }).join('');
  } else {
    const len = 26;
    const keyShifts = keyword.split('').map(kChar => {
      const uIdx = LATIN_UPPER.indexOf(kChar);
      if (uIdx !== -1) return uIdx;
      const lIdx = LATIN_LOWER.indexOf(kChar);
      if (lIdx !== -1) return lIdx;
      return -1;
    }).filter(shift => shift !== -1);

    if (keyShifts.length === 0) return text;

    let keyIdx = 0;
    return text.split('').map(char => {
      const uIdx = LATIN_UPPER.indexOf(char);
      const lIdx = LATIN_LOWER.indexOf(char);

      if (uIdx === -1 && lIdx === -1) {
        return char;
      }

      const currentShift = keyShifts[keyIdx % keyShifts.length];
      const actualShift = mode === 'encrypt' ? currentShift : (len - currentShift) % len;
      keyIdx++;

      if (uIdx !== -1) {
        return LATIN_UPPER[(uIdx + actualShift) % len];
      } else {
        return LATIN_LOWER[(lIdx + actualShift) % len];
      }
    }).join('');
  }
}

// Atbash Cipher algorithm
function atbashCipher(text: string, alphabetType: 'turkish' | 'latin'): string {
  if (alphabetType === 'turkish') {
    const upperRev = TURKISH_UPPER.split('').reverse().join('');
    const lowerRev = TURKISH_LOWER.split('').reverse().join('');

    return text.split('').map(char => {
      const uIdx = TURKISH_UPPER.indexOf(char);
      if (uIdx !== -1) return upperRev[uIdx];
      const lIdx = TURKISH_LOWER.indexOf(char);
      if (lIdx !== -1) return lowerRev[lIdx];
      return char;
    }).join('');
  } else {
    const upperRev = LATIN_UPPER.split('').reverse().join('');
    const lowerRev = LATIN_LOWER.split('').reverse().join('');

    return text.split('').map(char => {
      const uIdx = LATIN_UPPER.indexOf(char);
      if (uIdx !== -1) return upperRev[uIdx];
      const lIdx = LATIN_LOWER.indexOf(char);
      if (lIdx !== -1) return lowerRev[lIdx];
      return char;
    }).join('');
  }
}

// Base64 Encode/Decode
function base64Transform(text: string, mode: 'encrypt' | 'decrypt'): string {
  try {
    if (mode === 'encrypt') {
      return btoa(unescape(encodeURIComponent(text)));
    } else {
      return decodeURIComponent(escape(atob(text)));
    }
  } catch {
    return 'Invalid Base64 format.';
  }
}

// Crypto Hashing (Web Crypto API)
async function computeHash(text: string, algoName: 'SHA-256' | 'SHA-1'): Promise<string> {
  if (!text) return '';
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest(algoName, msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function CipherTool() {
  const { t } = useLanguage();
  const [cipherType, setCipherType] = useState<Algorithm>('caesar');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [shiftKey, setShiftKey] = useState<number>(3);
  const [vigenereKey, setVigenereKey] = useState<string>('KEY');
  const [alphabet, setAlphabet] = useState<'turkish' | 'latin'>('turkish');
  const [copied, setCopied] = useState(false);
  const [showBruteForce, setShowBruteForce] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput('');
      return;
    }

    let isMounted = true;

    const processTransformation = async () => {
      if (cipherType === 'caesar') {
        setOutput(caesarShift(input, shiftKey, mode, alphabet));
      } else if (cipherType === 'vigenere') {
        if (!vigenereKey.trim()) {
          setOutput(t('cipher.vigenere_key_error'));
        } else {
          setOutput(vigenereCipher(input, vigenereKey, mode, alphabet));
        }
      } else if (cipherType === 'rot13') {
        setOutput(caesarShift(input, 13, 'encrypt', alphabet));
      } else if (cipherType === 'atbash') {
        setOutput(atbashCipher(input, alphabet));
      } else if (cipherType === 'base64') {
        setOutput(base64Transform(input, mode));
      } else if (cipherType === 'sha256') {
        const res = await computeHash(input, 'SHA-256');
        if (isMounted) setOutput(res);
      } else if (cipherType === 'sha1') {
        const res = await computeHash(input, 'SHA-1');
        if (isMounted) setOutput(res);
      }
    };

    processTransformation();

    return () => {
      isMounted = false;
    };
  }, [input, mode, shiftKey, vigenereKey, alphabet, cipherType, t]);

  const handleCopy = (textToCopy?: string) => {
    navigator.clipboard.writeText(textToCopy || output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const toggleMode = () => {
    setMode(prev => prev === 'encrypt' ? 'decrypt' : 'encrypt');
    if (output && output !== t('cipher.vigenere_key_error') && !output.startsWith('Invalid')) {
      setInput(output);
    }
  };

  // Generate Caesar Brute-force candidates
  const getBruteForceResults = () => {
    if (!input) return [];
    const maxShift = alphabet === 'turkish' ? 28 : 25;
    const results = [];
    for (let s = 1; s <= maxShift; s++) {
      results.push({
        shift: s,
        text: caesarShift(input, s, 'decrypt', alphabet)
      });
    }
    return results;
  };

  const isHashMode = cipherType === 'sha256' || cipherType === 'sha1';

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
              <ShieldCheck className="w-3 h-3" />
              <span>ENCRYPTION & SECURITY ENGINE</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tighter">
              {t('cipher.title')} <span className="neon-text">{t('cipher.title_accent')}</span>
            </h2>
            <p className="text-neutral-400 mt-2">{t('cipher.desc')}</p>
          </div>

          {!isHashMode && (
            <button
              onClick={toggleMode}
              className="flex items-center gap-3 px-6 py-3 bg-finora-border hover:bg-neutral-800 rounded-xl transition-all group border border-transparent hover:border-finora-accent/30"
            >
              <div className="flex items-center gap-2 font-mono text-sm">
                {mode === 'encrypt' ? (
                  <>
                    <Lock className="w-4 h-4 text-finora-accent" />
                    <span>{t('cipher.mode_encrypt')}</span>
                    <ArrowRightLeft className="w-4 h-4 opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                    <Unlock className="w-4 h-4 text-neutral-500" />
                    <span className="opacity-40">{t('cipher.mode_decrypt')}</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-finora-accent" />
                    <span>{t('cipher.mode_decrypt')}</span>
                    <ArrowRightLeft className="w-4 h-4 opacity-40 group-hover:rotate-180 transition-transform duration-500" />
                    <Lock className="w-4 h-4 text-neutral-500" />
                    <span className="opacity-40">{t('cipher.mode_encrypt')}</span>
                  </>
                )}
              </div>
            </button>
          )}
        </div>

        {/* Configuration Controls Panel */}
        <div className="glass-panel p-6 space-y-6 border-finora-accent/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-finora-accent uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>{t('cipher.settings')}</span>
            </div>

            {cipherType === 'caesar' && (
              <button
                onClick={() => setShowBruteForce(!showBruteForce)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded-lg font-mono text-xs border transition-all",
                  showBruteForce 
                    ? "bg-finora-accent text-black border-finora-accent font-bold" 
                    : "bg-finora-border text-neutral-400 border-transparent hover:text-white"
                )}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>BRUTE-FORCE ANALYZER</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cipher Algorithm Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-neutral-400 uppercase">
                {t('cipher.algorithm')}
              </label>
              <select
                value={cipherType}
                onChange={(e) => setCipherType(e.target.value as Algorithm)}
                className="w-full bg-black/40 border border-finora-border rounded-xl p-3 text-sm font-mono text-white focus:outline-none focus:border-finora-accent cursor-pointer"
              >
                <option value="caesar">{t('cipher.algo_caesar')}</option>
                <option value="vigenere">{t('cipher.algo_vigenere')}</option>
                <option value="rot13">{t('cipher.algo_rot13')}</option>
                <option value="atbash">{t('cipher.algo_atbash')}</option>
                <option value="base64">{t('cipher.algo_base64')}</option>
                <option value="sha256">{t('cipher.algo_hash_sha256')}</option>
                <option value="sha1">{t('cipher.algo_hash_sha1')}</option>
              </select>
            </div>

            {/* Dynamic Controls based on chosen algorithm */}
            {cipherType === 'caesar' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                  <span className="flex items-center gap-1">
                    <Key className="w-3 h-3 text-finora-accent" />
                    {t('cipher.shift_key')}
                  </span>
                  <span className="text-finora-accent font-bold text-sm">{shiftKey}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={alphabet === 'turkish' ? 28 : 25}
                  value={shiftKey}
                  onChange={(e) => setShiftKey(parseInt(e.target.value, 10))}
                  className="w-full accent-finora-accent bg-black/40 cursor-pointer h-2 rounded-lg"
                />
              </div>
            )}

            {cipherType === 'vigenere' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-neutral-400 uppercase">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-finora-accent" />
                    {t('cipher.vigenere_key')}
                  </span>
                </div>
                <input
                  type="text"
                  value={vigenereKey}
                  onChange={(e) => setVigenereKey(e.target.value)}
                  placeholder={t('cipher.vigenere_key_placeholder')}
                  className="w-full bg-black/40 border border-finora-border rounded-xl px-3 py-2 text-sm font-mono text-finora-accent focus:outline-none focus:border-finora-accent uppercase"
                />
              </div>
            )}

            {(cipherType === 'rot13' || cipherType === 'atbash' || cipherType === 'base64' || isHashMode) && (
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-400 uppercase">
                  {isHashMode ? 'METHOD' : 'KEY SYSTEM'}
                </label>
                <div className="p-2.5 bg-black/40 border border-finora-border rounded-xl font-mono text-xs text-neutral-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-finora-accent animate-pulse" />
                  {isHashMode ? 'One-Way Hash' : 'Fixed Key / Automatic'}
                </div>
              </div>
            )}

            {/* Alphabet Selector (Only relevant for letter substitution algorithms) */}
            {(cipherType === 'caesar' || cipherType === 'vigenere' || cipherType === 'rot13' || cipherType === 'atbash') ? (
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-400 uppercase">
                  {t('cipher.alphabet')}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAlphabet('turkish')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-mono text-xs transition-all border",
                      alphabet === 'turkish' 
                        ? "bg-finora-accent text-black border-finora-accent font-bold" 
                        : "bg-black/20 border-finora-border text-neutral-400 hover:text-white"
                    )}
                  >
                    TR (29 Harf)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlphabet('latin')}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-mono text-xs transition-all border",
                      alphabet === 'latin' 
                        ? "bg-finora-accent text-black border-finora-accent font-bold" 
                        : "bg-black/20 border-finora-border text-neutral-400 hover:text-white"
                    )}
                  >
                    EN (26 Harf)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-mono text-neutral-400 uppercase">
                  ENCODING STANDARD
                </label>
                <div className="p-2.5 bg-black/40 border border-finora-border rounded-xl font-mono text-xs text-neutral-400">
                  UTF-8 / Binary Standard
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 gap-6">
          {/* Input Area */}
          <div className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                {isHashMode ? `${t('common.input')}: Raw String` : (mode === 'encrypt' ? `${t('common.input')}: ${t('cipher.plain_text')}` : `${t('common.input')}: ${t('cipher.cipher_text')}`)}
              </label>
              <button 
                onClick={handleClear}
                className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                title={t('common.clear')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encrypt' ? t('cipher.placeholder_encrypt') : t('cipher.placeholder_decrypt')}
              className="w-full h-40 bg-black/20 border border-finora-border rounded-xl p-4 font-mono text-sm focus:outline-none focus:border-finora-accent/50 transition-colors resize-none"
            />
          </div>

          {/* Output Area */}
          <div className="glass-panel p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="w-24 h-24 text-finora-accent" />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <label className="font-mono text-[10px] uppercase tracking-widest text-finora-accent">
                {isHashMode ? `${t('common.output')}: Cryptographic Hash` : (mode === 'encrypt' ? `${t('common.output')}: ${t('cipher.cipher_text')}` : `${t('common.output')}: ${t('cipher.plain_text')}`)}
              </label>
              <button 
                onClick={() => handleCopy()}
                disabled={!output || output === t('cipher.vigenere_key_error')}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                  copied 
                    ? "bg-finora-accent text-black" 
                    : "bg-finora-border text-neutral-400 hover:text-white disabled:opacity-30"
                )}
              >
                {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? t('common.copied') : t('common.copy')}
              </button>
            </div>

            <div className="w-full h-40 bg-finora-accent/5 border border-finora-accent/10 rounded-xl p-4 font-mono text-sm text-finora-accent break-all overflow-y-auto relative z-10">
              {output || <span className="opacity-20 italic">{t('common.result_placeholder')}</span>}
            </div>
          </div>
        </div>

        {/* Caesar Brute Force Analyzer Panel */}
        {showBruteForce && cipherType === 'caesar' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-panel p-6 space-y-4 border-finora-accent/30"
          >
            <div className="flex items-center gap-2 font-mono text-xs text-finora-accent uppercase tracking-wider">
              <Search className="w-4 h-4" />
              <span>{t('cipher.brute_force_title')}</span>
            </div>
            <p className="text-xs text-neutral-400 font-mono">{t('cipher.brute_force_desc')}</p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 font-mono text-xs">
              {input ? (
                getBruteForceResults().map((item) => (
                  <div 
                    key={item.shift}
                    className="flex items-center justify-between p-2.5 bg-black/40 border border-finora-border hover:border-finora-accent/40 rounded-lg group transition-all"
                  >
                    <span className="text-neutral-500 w-24">Shift +{item.shift}:</span>
                    <span className="text-neutral-200 flex-1 truncate px-2">{item.text}</span>
                    <button
                      onClick={() => {
                        setShiftKey(item.shift);
                        handleCopy(item.text);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-finora-accent hover:underline flex items-center gap-1"
                    >
                      <span>KULLAN & KOPYALA</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-neutral-600 italic py-4 text-center">
                  Analiz için yukarıdaki alana metin girin...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer Info */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent" />
          <p>
            <span className="text-finora-accent">{t('common.info')}:</span> {t('cipher.info_text')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
