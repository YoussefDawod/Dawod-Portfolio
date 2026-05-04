import { useTheme } from './useTheme.js';
import { TbSun, TbMoon } from 'react-icons/tb';
import './themeToggle.css';

/**
 * ThemeToggle — fixierter Icon-Button oben rechts.
 * Wechselt zwischen Dark und Light, mit weichem Sun/Moon-Crossfade.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';
  const label = isLight ? 'Auf dunkles Design wechseln' : 'Auf helles Design wechseln';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      data-theme-state={theme}
    >
      <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
        <TbSun />
      </span>
      <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
        <TbMoon />
      </span>
    </button>
  );
}
