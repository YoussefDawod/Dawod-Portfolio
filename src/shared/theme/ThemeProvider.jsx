import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeContext } from './themeContext.js';

const STORAGE_KEY = 'yd-theme';
const ATTR = 'data-theme';

/**
 * Liefert das initial Theme:
 *   1. localStorage, falls gesetzt ('dark' | 'light')
 *   2. sonst System-Preference
 *   3. fallback 'dark'
 */
function readInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* localStorage blockiert */
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  // DOM-Sync: data-theme + meta[name=theme-color] + BGS-Cache-Invalidation
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute(ATTR, theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#fafaf7' : '#0e0c09');
    }
    // BGS und andere Theme-Konsumenten benachrichtigen
    window.dispatchEvent(new CustomEvent('yd-theme-change', { detail: { theme } }));
  }, [theme]);

  // Persistenz
  const setTheme = useCallback((next) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme: theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
