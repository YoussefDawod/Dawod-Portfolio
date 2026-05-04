import { createContext } from 'react';

/**
 * ThemeContext — separat ausgelagert, damit ThemeProvider.jsx
 * react-refresh/only-export-components erfüllt.
 */
export const ThemeContext = createContext({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});
