import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'zinn-language';
const DEFAULT_LANGUAGE = 'en';
const RTL_LANGUAGES = ['ar', 'ur'];

// Mirror the page for right-to-left languages and tell browsers/screen readers the language.
function applyDocumentLanguage(lang) {
  if (typeof document === 'undefined') return;
  document.documentElement.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}

// Languages with full translation files available
const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'zh', 'hi', 'ar', 'bn', 'pt', 'ru', 'ur', 'ja', 'af', 'zu', 'xh'];

// Map browser locale codes to our supported language codes
const mapBrowserLanguage = (browserLang) => {
  if (!browserLang) return DEFAULT_LANGUAGE;
  const lower = browserLang.toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(lower)) return lower;
  const base = lower.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(base)) return base;
  if (base === 'zh') return 'zh';
  return DEFAULT_LANGUAGE;
};

// Detect the device/browser language on first launch
const detectDeviceLanguage = () => {
  if (typeof navigator !== 'undefined') {
    const browserLangs = navigator.languages || [navigator.language];
    for (const lang of browserLangs) {
      const mapped = mapBrowserLanguage(lang);
      if (mapped !== DEFAULT_LANGUAGE) return mapped;
    }
    if (browserLangs[0]) return mapBrowserLanguage(browserLangs[0]);
  }
  return DEFAULT_LANGUAGE;
};

// --- Global store (single source of truth, shared across all components) ---
let currentLanguage = DEFAULT_LANGUAGE;
let isLoaded = false;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function getSnapshot() {
  return currentLanguage;
}

// Initialize synchronously from localStorage or auto-detect
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    currentLanguage = saved;
  } else {
    const detected = detectDeviceLanguage();
    currentLanguage = detected;
    localStorage.setItem(STORAGE_KEY, detected);
  }
  isLoaded = true;
  applyDocumentLanguage(currentLanguage);

  // Keep all tabs/tokens in sync
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      currentLanguage = e.newValue;
      applyDocumentLanguage(e.newValue);
      notify();
    }
  });
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setLanguagePreference = (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    currentLanguage = lang;
    applyDocumentLanguage(lang);
    notify();
  };

  return { language, setLanguage: setLanguagePreference, isLoaded };
}