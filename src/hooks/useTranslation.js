import { useLanguage } from './useLanguage';
import enTranslations from '@/lib/translations/en.json';
import esTranslations from '@/lib/translations/es.json';
import frTranslations from '@/lib/translations/fr.json';
import zhTranslations from '@/lib/translations/zh.json';
import hiTranslations from '@/lib/translations/hi.json';
import arTranslations from '@/lib/translations/ar.json';
import bnTranslations from '@/lib/translations/bn.json';
import ptTranslations from '@/lib/translations/pt.json';
import ruTranslations from '@/lib/translations/ru.json';
import urTranslations from '@/lib/translations/ur.json';
import jaTranslations from '@/lib/translations/ja.json';
import afTranslations from '@/lib/translations/af.json';
import zuTranslations from '@/lib/translations/zu.json';
import xhTranslations from '@/lib/translations/xh.json';

// Map of loaded translations
const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  zh: zhTranslations,
  hi: hiTranslations,
  ar: arTranslations,
  bn: bnTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
  ur: urTranslations,
  ja: jaTranslations,
  af: afTranslations,
  zu: zuTranslations,
  xh: xhTranslations,
};

// Function to safely get nested translation keys
const getTranslation = (obj, keyPath) => {
  const keys = keyPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return keyPath; // Return the key path if translation not found
    }
  }
  return current;
};

// Substitute {param} placeholders in a string
const substituteParams = (str, params) => {
  if (!params || typeof str !== 'string') return str;
  let result = str;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
};

export function useTranslation() {
  const { language } = useLanguage();
  const lang = language || 'en';
  // Resolve synchronously — no useState/useEffect delay
  const currentTranslations = translations[lang] || translations['en'];

  const t = (key, params) => {
    let value = getTranslation(currentTranslations, key);
    // Fall back to English if the key is missing in the current language
    if (value === key && currentTranslations !== translations['en']) {
      value = getTranslation(translations['en'], key);
    }
    return substituteParams(value, params);
  };

  return { t, language };
}