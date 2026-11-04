import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from './useLanguage';
import { getLanguageName } from '@/lib/aiLanguage';
import { hasTranslatableText } from '@/lib/translatable';

const CACHE_KEY = 'zinn-translations-json';

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

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function useTranslatedJson(data) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(data);

  const dataIsString = typeof data === 'string';
  const dataKey = data != null ? (dataIsString ? data : JSON.stringify(data)) : '';

  const [prevKey, setPrevKey] = useState(dataKey);
  if (dataKey !== prevKey) {
    setPrevKey(dataKey);
    setTranslated(data);
  }

  useEffect(() => {
    if (dataKey === '' || language === 'en' || !hasTranslatableText(data)) {
      setTranslated(data);
      return;
    }

    const cacheKey = `${language}:${hashString(dataKey)}`;
    const cached = getCachedTranslations();
    if (cached[cacheKey] != null) {
      try {
        const result = dataIsString ? cached[cacheKey] : JSON.parse(cached[cacheKey]);
        setTranslated(result);
      } catch {
        setTranslated(data);
      }
      return;
    }

    let cancelled = false;
    setTranslated(data);

    (async () => {
      try {
        const content = dataIsString ? data : JSON.stringify(data);
        const response = await base44.functions.invoke('translateJson', {
          content,
          language,
          languageName: getLanguageName(language),
        });
        if (cancelled) return;

        const resultStr = response?.data?.result;
        if (typeof resultStr === 'string') {
          const cleanStr = resultStr.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          if (dataIsString) {
            setTranslated(cleanStr);
            setCachedTranslation(cacheKey, cleanStr);
          } else {
            try {
              const parsed = JSON.parse(cleanStr);
              setTranslated(parsed);
              setCachedTranslation(cacheKey, JSON.stringify(parsed));
            } catch {
              setTranslated(data);
            }
          }
        } else if (resultStr && typeof resultStr === 'object') {
          if (dataIsString) {
            const str = JSON.stringify(resultStr);
            setTranslated(str);
            setCachedTranslation(cacheKey, str);
          } else {
            setTranslated(resultStr);
            setCachedTranslation(cacheKey, JSON.stringify(resultStr));
          }
        }
      } catch {
        // Keep original data on error
      }
    })();

    return () => { cancelled = true; };
  }, [dataKey, language]);

  return translated;
}