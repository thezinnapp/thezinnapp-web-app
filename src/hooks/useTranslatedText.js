import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './useLanguage';
import { getLanguageName } from '@/lib/aiLanguage';
import { hasTranslatableText } from '@/lib/translatable';

const CACHE_KEY = 'zinn-translations-text';

function getCachedTranslations() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setCachedTranslation(key, value) {
  const cache = getCachedTranslations();
  cache[key] = value;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

export function useTranslatedText(text) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (!text || language === 'en' || !hasTranslatableText(text)) {
      setTranslated(text);
      return;
    }

    const cacheKey = `${language}:${text}`;
    const cached = getCachedTranslations();
    if (cached[cacheKey] != null) {
      setTranslated(cached[cacheKey]);
      return;
    }

    let cancelled = false;
    setTranslated(text);

    (async () => {
      try {
        const response = await base44.functions.invoke('translateJson', {
          content: JSON.stringify({ text }),
          language,
          languageName: getLanguageName(language),
        });
        if (cancelled) return;

        const resultStr = response?.data?.result;
        let result = text;
        if (typeof resultStr === 'string') {
          const cleanStr = resultStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          try {
            const parsed = JSON.parse(cleanStr);
            result = parsed.text || text;
          } catch {
            result = text;
          }
        } else if (resultStr && typeof resultStr === 'object') {
          result = resultStr.text || text;
        }

        setTranslated(result);
        setCachedTranslation(cacheKey, result);
      } catch {
        // Keep original text on error
      }
    })();

    return () => { cancelled = true; };
  }, [text, language]);

  return translated;
}