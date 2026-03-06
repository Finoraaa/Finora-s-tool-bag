import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  tr: {
    // Navbar
    'nav.title': "FINORA'NIN",
    'nav.title_accent': 'SIRT ÇANTASI',
    'nav.home': 'Ana Sayfa',
    'nav.tools': 'Araçlar',
    'nav.image_analysis': 'Görsel Analiz & Format',
    'nav.binary_converter': 'Binary Dönüştürücü',
    'nav.password_generator': 'Şifre Oluşturucu',
    'nav.morse_converter': 'Mors Dönüştürücü',
    'nav.color_explorer': 'Renk Gezgini',
    'nav.favicon_generator': 'Favicon Oluşturucu',
    'nav.json_converter': 'JSON Model Dönüştürücü',
    'nav.ascii_art': 'ASCII Sanatı Oluşturucu',
    
    // Home
    'home.badge': 'DİJİTAL ARAÇ KİTİ V1.0',
    'home.title': "FINORA'NIN",
    'home.title_accent': 'SIRT ÇANTASI',
    'home.description': "Finora'nın sırt çantası, geliştiriciler ve tasarımcılar için tasarlanmış modern, hızlı ve güvenli araçlar sunar. Tüm işlemler tarayıcınızda gerçekleşir.",
    'home.cta_start': 'Hemen Başla',
    'home.cta_github': 'GitHub\'da İncele',
    'home.features_title': 'Neden Finora?',
    'home.feature_secure': 'Güvenli',
    'home.feature_secure_desc': 'Verileriniz asla sunucularımıza gönderilmez.',
    'home.feature_fast': 'Hızlı',
    'home.feature_fast_desc': 'Anlık dönüşüm ve analiz sonuçları.',
    'home.feature_modern': 'Modern',
    'home.feature_modern_desc': 'Kullanıcı dostu ve şık arayüz.',

    // Common
    'common.copy': 'KOPYALA',
    'common.copied': 'KOPYALANDI',
    'common.clear': 'Temizle',
    'common.input': 'Giriş',
    'common.output': 'Çıkış',
    'common.result_placeholder': 'Sonuç burada görünecek...',
    'common.random': 'Rastgele',
    'common.info': 'BİLGİ',
    'common.pro_tip': 'İPUCU',

    // Binary Tool
    'binary.title': 'BINARY',
    'binary.title_accent': 'DÖNÜŞTÜRÜCÜ',
    'binary.desc': 'Metin ve Binary (ikilik sistem) arasında anında dönüşüm yapın.',
    'binary.mode_text': 'METİN',
    'binary.mode_binary': 'BINARY',
    'binary.placeholder_text': 'Dönüştürülecek metni buraya yazın...',
    'binary.placeholder_binary': '01001000 01100101 01101100 01101100 01101111',

    // Password Tool
    'password.title': 'ŞİFRE',
    'password.title_accent': 'OLUŞTURUCU',
    'password.desc': 'Güvenli ve kırılması zor şifreler oluşturun.',
    'password.length': 'ŞİFRE UZUNLUĞU',
    'password.settings': 'KARAKTER AYARLARI',
    'password.uppercase': 'Büyük Harf (ABC)',
    'password.lowercase': 'Küçük Harf (abc)',
    'password.numbers': 'Rakamlar (123)',
    'password.symbols': 'Semboller (#$&)',
    'password.strength': 'GÜVENLİK SEVİYESİ',
    'password.strength_very_weak': 'ÇOK ZAYIF',
    'password.strength_weak': 'ZAYIF',
    'password.strength_medium': 'ORTA',
    'password.strength_strong': 'GÜÇLÜ',
    'password.strength_very_strong': 'ÇOK GÜÇLÜ',
    'password.generate': 'YENİ ŞİFRE ÜRET',

    // Morse Tool
    'morse.title': 'MORS',
    'morse.title_accent': 'DÖNÜŞTÜRÜCÜ',
    'morse.desc': 'Metin ve Mors alfabesi arasında anında dönüşüm yapın.',
    'morse.listen': 'DİNLE',
    'morse.info_text': 'Kelimeler arası ayrım için \'/\' karakteri kullanılır. Her harf arasında bir boşluk bırakılır.',

    // Color Tool
    'color.title': 'RENK',
    'color.title_accent': 'GEZGİNİ',
    'color.desc': 'Gelişmiş renk seçici ile mükemmel armonileri yakalayın.',
    'color.hue': 'Ton (Hue)',
    'color.selected': 'Seçili Renk',
    'color.rgb_values': 'RGB Değerleri',
    'color.palette_title': 'Akıllı Renk Paleti',
    'color.pro_tip_text': 'Renk seçici HSV modelini kullanır. Bu model, insan gözünün renkleri algılama biçimine daha yakındır.',

    // Image Tool
    'image.title': 'GÖRSEL',
    'image.title_accent': 'ANALİZ',
    'image.desc': 'Görsellerinizi analiz edin, formatlarını değiştirin ve detayları görün.',
    'image.drop': 'Görseli buraya sürükleyin veya seçmek için tıklayın',
    'image.analyzing': 'Analiz ediliyor...',
    'image.details': 'Görsel Detayları',
    'image.format': 'Format',
    'image.dimensions': 'Boyutlar',
    'image.size': 'Dosya Boyutu',
    'image.actions': 'İşlemler',
    'image.convert_to': 'Formatına Dönüştür',

    // Favicon Tool
    'favicon.title': 'FAVICON',
    'favicon.title_accent': 'OLUŞTURUCU',
    'favicon.desc': 'Logonuzu tüm tarayıcı ve cihazlar için profesyonel bir favicon paketine dönüştürün.',
    'favicon.download_pack': 'PAKETİ İNDİR (.ZIP)',
    'favicon.html_code': 'HTML KODU',
    'favicon.preview_all': 'Tüm Boyutları Önizle',
    'favicon.info_text': 'Oluşturulan paket; 16x16, 32x32, 180x180 (Apple Touch) ve 192x192, 512x512 (Android) boyutlarını içerir.',

    // JSON Converter Tool
    'json.title': 'JSON',
    'json.title_accent': 'MODEL DÖNÜŞTÜRÜCÜ',
    'json.desc': 'JSON verilerinizi anında TypeScript, Go veya Java modellerine dönüştürün.',
    'json.placeholder': 'JSON verisini buraya yapıştırın...',
    'json.select_lang': 'HEDEF DİL SEÇİN',
    'json.root_name': 'KÖK SINIF ADI',
    'json.error_invalid': 'Geçersiz JSON formatı. Lütfen kontrol edin.',
    'json.empty_warning': 'Dönüştürülecek JSON verisi bulunamadı.',

    // ASCII Tool
    'ascii.title': 'ASCII',
    'ascii.title_accent': 'SANATI OLUŞTURUCU',
    'ascii.desc': 'Metinlerinizi veya görsellerinizi havalı ASCII karakterlerine dönüştürün.',
    'ascii.mode_text': 'METİN',
    'ascii.mode_image': 'GÖRSEL',
    'ascii.placeholder': 'ASCII sanatına dönüştürülecek metni yazın...',
    'ascii.settings': 'AYARLAR',
    'ascii.font': 'YAZI TİPİ',
    'ascii.width': 'GENİŞLİK',
    'ascii.contrast': 'KONTRAST',
    'ascii.chars': 'KARAKTER SETİ',
    'tools.title': 'ARAÇ',
    'tools.title_accent': 'KATALOĞU',
    'tools.launch': 'ARACI BAŞLAT',
  },
  en: {
    // Navbar
    'nav.title': "FINORA'S",
    'nav.title_accent': 'TOOL BAG',
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.image_analysis': 'Image Analysis & Format',
    'nav.binary_converter': 'Binary Converter',
    'nav.password_generator': 'Password Generator',
    'nav.morse_converter': 'Morse Converter',
    'nav.color_explorer': 'Color Explorer',
    'nav.favicon_generator': 'Favicon Generator',
    'nav.json_converter': 'JSON to Model',
    'nav.ascii_art': 'ASCII Art Generator',
    
    // Home
    'home.badge': 'DIGITAL TOOLKIT V1.0',
    'home.title': "FINORA'S",
    'home.title_accent': 'TOOL BAG',
    'home.description': "Finora's tool bag offers modern, fast, and secure tools designed for developers and designers. All operations happen in your browser.",
    'home.cta_start': 'Get Started',
    'home.cta_github': 'View on GitHub',
    'home.features_title': 'Why Finora?',
    'home.feature_secure': 'Secure',
    'home.feature_secure_desc': 'Your data is never sent to our servers.',
    'home.feature_fast': 'Fast',
    'home.feature_fast_desc': 'Instant conversion and analysis results.',
    'home.feature_modern': 'Modern',
    'home.feature_modern_desc': 'User-friendly and stylish interface.',

    // Common
    'common.copy': 'COPY',
    'common.copied': 'COPIED',
    'common.clear': 'Clear',
    'common.input': 'Input',
    'common.output': 'Output',
    'common.result_placeholder': 'Result will appear here...',
    'common.random': 'Random',
    'common.info': 'INFO',
    'common.pro_tip': 'PRO TIP',

    // Binary Tool
    'binary.title': 'BINARY',
    'binary.title_accent': 'CONVERTER',
    'binary.desc': 'Instantly convert between text and Binary (base-2 system).',
    'binary.mode_text': 'TEXT',
    'binary.mode_binary': 'BINARY',
    'binary.placeholder_text': 'Type text to convert...',
    'binary.placeholder_binary': '01001000 01100101 01101100 01101100 01101111',

    // Password Tool
    'password.title': 'PASSWORD',
    'password.title_accent': 'GENERATOR',
    'password.desc': 'Generate secure and hard-to-crack passwords.',
    'password.length': 'PASSWORD LENGTH',
    'password.settings': 'CHARACTER SETTINGS',
    'password.uppercase': 'Uppercase (ABC)',
    'password.lowercase': 'Lowercase (abc)',
    'password.numbers': 'Numbers (123)',
    'password.symbols': 'Symbols (#$&)',
    'password.strength': 'STRENGTH LEVEL',
    'password.strength_very_weak': 'VERY WEAK',
    'password.strength_weak': 'WEAK',
    'password.strength_medium': 'MEDIUM',
    'password.strength_strong': 'STRONG',
    'password.strength_very_strong': 'VERY STRONG',
    'password.generate': 'GENERATE NEW PASSWORD',

    // Morse Tool
    'morse.title': 'MORSE',
    'morse.title_accent': 'CONVERTER',
    'morse.desc': 'Instantly convert between text and Morse code.',
    'morse.listen': 'LISTEN',
    'morse.info_text': 'Use \'/\' to separate words. A single space is used between characters.',

    // Color Tool
    'color.title': 'COLOR',
    'color.title_accent': 'EXPLORER',
    'color.desc': 'Capture perfect harmonies with the advanced color picker.',
    'color.hue': 'Hue',
    'color.selected': 'Selected Color',
    'color.rgb_values': 'RGB Values',
    'color.palette_title': 'Smart Color Palette',
    'color.pro_tip_text': 'The color picker uses the HSV model, which is closer to how human eyes perceive colors.',

    // Image Tool
    'image.title': 'IMAGE',
    'image.title_accent': 'ANALYSIS',
    'image.desc': 'Analyze your images, change formats, and see details.',
    'image.drop': 'Drop image here or click to select',
    'image.analyzing': 'Analyzing...',
    'image.details': 'Image Details',
    'image.format': 'Format',
    'image.dimensions': 'Dimensions',
    'image.size': 'File Size',
    'image.actions': 'Actions',
    'image.convert_to': 'Convert to',

    // Favicon Tool
    'favicon.title': 'FAVICON',
    'favicon.title_accent': 'GENERATOR',
    'favicon.desc': 'Convert your logo into a professional favicon package for all browsers and devices.',
    'favicon.download_pack': 'DOWNLOAD PACK (.ZIP)',
    'favicon.html_code': 'HTML CODE',
    'favicon.preview_all': 'Preview All Sizes',
    'favicon.info_text': 'Generated package includes 16x16, 32x32, 180x180 (Apple Touch), and 192x192, 512x512 (Android) sizes.',

    // JSON Converter Tool
    'json.title': 'JSON',
    'json.title_accent': 'TO MODEL',
    'json.desc': 'Instantly convert your JSON data into TypeScript, Go, or Java models.',
    'json.placeholder': 'Paste your JSON data here...',
    'json.select_lang': 'SELECT TARGET LANGUAGE',
    'json.root_name': 'ROOT CLASS NAME',
    'json.error_invalid': 'Invalid JSON format. Please check your input.',
    'json.empty_warning': 'No JSON data found to convert.',

    // ASCII Tool
    'ascii.title': 'ASCII',
    'ascii.title_accent': 'ART GENERATOR',
    'ascii.desc': 'Convert your text or images into cool ASCII characters.',
    'ascii.mode_text': 'TEXT',
    'ascii.mode_image': 'IMAGE',
    'ascii.placeholder': 'Type text to convert to ASCII art...',
    'ascii.settings': 'SETTINGS',
    'ascii.font': 'FONT',
    'ascii.width': 'WIDTH',
    'ascii.contrast': 'CONTRAST',
    'ascii.chars': 'CHARACTER SET',
    'tools.title': 'TOOLS',
    'tools.title_accent': 'CATALOG',
    'tools.launch': 'LAUNCH TOOL',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('finora_lang');
    return (saved as Language) || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('finora_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
