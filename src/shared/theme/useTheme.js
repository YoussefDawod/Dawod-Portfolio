import { useContext } from 'react';
import { ThemeContext } from './themeContext.js';

/**
 * useTheme — Zugriff auf aktuelles Theme + Toggle.
 * In eigener Datei wegen react-refresh/only-export-components.
 */
export function useTheme() {
  return useContext(ThemeContext);
}
