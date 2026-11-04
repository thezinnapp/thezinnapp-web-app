import { useEffect, useState } from 'react';
import { Capacitor, SystemBars, SystemBarsStyle } from '@capacitor/core';

// In the iPhone/Android apps, keep the clock/battery icons readable:
// light icons on the dark theme, dark icons on the light theme.
export function setPhoneBars(dark) {
  if (!Capacitor.isNativePlatform()) return;
  // Android phones with an old built-in browser engine (before version 140) keep plain
  // light bars above and below the app, so their icons must stay dark to be seen.
  const engine = Number((navigator.userAgent.match(/Chrome\/(\d+)/) || [])[1] || 0);
  const lightBars = Capacitor.getPlatform() === 'android' && engine > 0 && engine < 140;
  const style = lightBars ? SystemBarsStyle.Light : dark ? SystemBarsStyle.Dark : SystemBarsStyle.Light;
  SystemBars.setStyle({ style }).catch(() => {});
}

// Auto mode is time-based: light during daytime hours, dark at night.
// Daytime window: 6:00 AM – 8:00 PM local time.
function isDaytime() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 20;
}

export function useDarkMode() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('zinn-theme') || 'auto';
    } catch {
      return 'auto';
    }
  });

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;

    const apply = (dark) => {
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Update the existing meta in place — Safari reads it on page load
      // from the inline boot script and won't pick up a recreated meta.
      let meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', dark ? '#151719' : '#FDFCF7');
      let cs = document.querySelector('meta[name="color-scheme"]');
      if (!cs) {
        cs = document.createElement('meta');
        cs.setAttribute('name', 'color-scheme');
        document.head.appendChild(cs);
      }
      cs.setAttribute('content', dark ? 'dark' : 'light');
      let sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (!sb) {
        sb = document.createElement('meta');
        sb.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
        document.head.appendChild(sb);
      }
      sb.setAttribute('content', dark ? 'black-translucent' : 'default');
      setPhoneBars(dark);
    };

    let interval;
    if (theme === 'auto') {
      apply(!isDaytime());
      // Re-evaluate every minute so the theme flips at the day/night boundary.
      interval = setInterval(() => {
        apply(!isDaytime());
      }, 60000);
    } else {
      apply(theme === 'dark');
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [theme]);

  const setThemeMode = (mode) => {
    localStorage.setItem('zinn-theme', mode);
    setTheme(mode);
    // Safari caches theme-color and ignores dynamic meta changes.
    // Reload so the inline boot script sets the correct color on load.
    window.location.reload();
  };

  return { theme, setTheme: setThemeMode };
}