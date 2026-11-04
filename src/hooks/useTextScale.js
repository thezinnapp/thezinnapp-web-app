import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cognipath-text-scale';
const MIN_SCALE = 0.85;
const MAX_SCALE = 1.3;
const DEFAULT_SCALE = 1.3;

function clamp(val) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, val));
}

export function useTextScale() {
  const [textScale, setTextScale] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? clamp(parseFloat(stored)) : DEFAULT_SCALE;
    } catch {
      return DEFAULT_SCALE;
    }
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${textScale * 100}%`;
    try {
      localStorage.setItem(STORAGE_KEY, String(textScale));
    } catch {}
  }, [textScale]);

  const setScale = useCallback((val) => {
    setTextScale(clamp(val));
  }, []);

  const reset = useCallback(() => setTextScale(DEFAULT_SCALE), []);

  return { textScale, setScale, reset, MIN_SCALE, MAX_SCALE, DEFAULT_SCALE };
}