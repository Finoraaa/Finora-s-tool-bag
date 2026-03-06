import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Trash2, 
  Terminal, 
  Braces,
  ChevronRight,
  FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type TargetLanguage = 'typescript' | 'go' | 'java';

export default function JsonConverterTool() {
  const { t } = useLanguage();
  const [jsonInput, setJsonInput] = useState('');
  const [output, setOutput] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('typescript');
  const [rootName, setRootName] = useState('Root');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (jsonInput.trim()) {
      handleConvert();
    } else {
      setOutput('');
      setError(null);
    }
  }, [jsonInput, targetLang, rootName]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const getType = (val: any): string => {
    if (val === null) return 'any';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const convertToTypeScript = (obj: any, name: string): string => {
    let result = '';
    const interfaces: string[] = [];

    const process = (currentObj: any, currentName: string) => {
      let interfaceStr = `interface ${currentName} {\n`;
      for (const key in currentObj) {
        const val = currentObj[key];
        const type = getType(val);
        
        if (type === 'object' && val !== null) {
          const subName = capitalize(key);
          interfaceStr += `  ${key}: ${subName};\n`;
          process(val, subName);
        } else if (type === 'array') {
          if (val.length > 0 && getType(val[0]) === 'object') {
            const subName = capitalize(key);
            interfaceStr += `  ${key}: ${subName}[];\n`;
            process(val[0], subName);
          } else {
            const innerType = val.length > 0 ? typeof val[0] : 'any';
            interfaceStr += `  ${key}: ${innerType}[];\n`;
          }
        } else {
          interfaceStr += `  ${key}: ${type};\n`;
        }
      }
      interfaceStr += `}\n\n`;
      interfaces.push(interfaceStr);
    };

    process(obj, name);
    return interfaces.reverse().join('');
  };

  const convertToGo = (obj: any, name: string): string => {
    const structs: string[] = [];

    const process = (currentObj: any, currentName: string) => {
      let structStr = `type ${currentName} struct {\n`;
      for (const key in currentObj) {
        const val = currentObj[key];
        const type = getType(val);
        const goKey = capitalize(key);
        
        if (type === 'object' && val !== null) {
          const subName = capitalize(key);
          structStr += `\t${goKey} ${subName} \`json:"${key}"\`\n`;
          process(val, subName);
        } else if (type === 'array') {
          if (val.length > 0 && getType(val[0]) === 'object') {
            const subName = capitalize(key);
            structStr += `\t${goKey} []${subName} \`json:"${key}"\`\n`;
            process(val[0], subName);
          } else {
            const innerType = val.length > 0 ? (typeof val[0] === 'number' ? 'float64' : typeof val[0]) : 'interface{}';
            structStr += `\t${goKey} []${innerType} \`json:"${key}"\`\n`;
          }
        } else {
          let goType = 'interface{}';
          if (type === 'string') goType = 'string';
          if (type === 'number') goType = 'float64';
          if (type === 'boolean') goType = 'bool';
          structStr += `\t${goKey} ${goType} \`json:"${key}"\`\n`;
        }
      }
      structStr += `}\n\n`;
      structs.push(structStr);
    };

    process(obj, name);
    return structs.reverse().join('');
  };

  const convertToJava = (obj: any, name: string): string => {
    const classes: string[] = [];

    const process = (currentObj: any, currentName: string) => {
      let classStr = `public class ${currentName} {\n`;
      for (const key in currentObj) {
        const val = currentObj[key];
        const type = getType(val);
        
        if (type === 'object' && val !== null) {
          const subName = capitalize(key);
          classStr += `    private ${subName} ${key};\n`;
          process(val, subName);
        } else if (type === 'array') {
          if (val.length > 0 && getType(val[0]) === 'object') {
            const subName = capitalize(key);
            classStr += `    private List<${subName}> ${key};\n`;
            process(val[0], subName);
          } else {
            let innerType = 'Object';
            if (val.length > 0) {
              const t = typeof val[0];
              if (t === 'string') innerType = 'String';
              if (t === 'number') innerType = 'Double';
              if (t === 'boolean') innerType = 'Boolean';
            }
            classStr += `    private List<${innerType}> ${key};\n`;
          }
        } else {
          let javaType = 'Object';
          if (type === 'string') javaType = 'String';
          if (type === 'number') javaType = 'Double';
          if (type === 'boolean') javaType = 'Boolean';
          classStr += `    private ${javaType} ${key};\n`;
        }
      }
      classStr += `}\n\n`;
      classes.push(classStr);
    };

    process(obj, name);
    return classes.reverse().join('');
  };

  const handleConvert = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setError(null);
      
      let result = '';
      const root = capitalize(rootName || 'Root');

      if (targetLang === 'typescript') result = convertToTypeScript(parsed, root);
      if (targetLang === 'go') result = convertToGo(parsed, root);
      if (targetLang === 'java') result = convertToJava(parsed, root);

      setOutput(result);
    } catch (e) {
      setError(t('json.error_invalid'));
      setOutput('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-finora-accent/10 border border-finora-accent/20 text-finora-accent text-xs font-mono mb-4">
            <Braces className="w-3 h-3" />
            <span>DATA TRANSFORMATION CORE</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter">
            {t('json.title')} <span className="neon-text">{t('json.title_accent')}</span>
          </h2>
          <p className="text-neutral-400 mt-2">{t('json.desc')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-finora-accent">
                <FileJson className="w-4 h-4" />
                <h4 className="font-mono text-xs uppercase tracking-widest">{t('common.input')}</h4>
              </div>
              <button 
                onClick={() => setJsonInput('')}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('common.clear')}
              </button>
            </div>
            
            <div className="relative group">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder={t('json.placeholder')}
                className="w-full h-[500px] bg-black/40 border border-finora-border rounded-xl p-6 font-mono text-sm resize-none focus:outline-none focus:border-finora-accent/50 transition-all"
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-finora-accent">
                <Code2 className="w-4 h-4" />
                <h4 className="font-mono text-xs uppercase tracking-widest">{t('common.output')}</h4>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-finora-border/30 rounded-lg p-1">
                  {(['typescript', 'go', 'java'] as TargetLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTargetLang(lang)}
                      className={cn(
                        "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all",
                        targetLang === lang ? "bg-finora-accent text-black" : "text-neutral-500 hover:text-white"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                {output && (
                  <button 
                    onClick={handleCopy}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                      copied ? "bg-finora-accent text-black" : "bg-finora-border text-neutral-400 hover:text-white"
                    )}
                  >
                    {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? t('common.copied') : t('common.copy')}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex-1">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 block mb-1">{t('json.root_name')}</label>
                  <input 
                    type="text" 
                    value={rootName}
                    onChange={(e) => setRootName(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono p-0"
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </div>

              <div className="relative group">
                <pre className="w-full h-[420px] bg-black/40 border border-finora-border rounded-xl p-6 font-mono text-sm text-neutral-300 overflow-auto">
                  <code>{output || t('common.result_placeholder')}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="flex items-center gap-4 p-4 bg-finora-border/30 rounded-xl border border-finora-border/50 text-xs font-mono text-neutral-500">
          <Terminal className="w-4 h-4 text-finora-accent" />
          <p>
            <span className="text-finora-accent">SYSTEM_LOG:</span> Model generation is performed locally. Nested objects are recursively mapped to nested structures.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
