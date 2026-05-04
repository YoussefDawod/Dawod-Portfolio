import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './hintBanner.css';

const STORAGE_KEY = 'yd-notice';

export default function HintBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;

    function show() {
      setVisible(true);
    }

    window.addEventListener('wheel', show, { once: true, passive: true });
    window.addEventListener('touchmove', show, { once: true, passive: true });

    return () => {
      window.removeEventListener('wheel', show);
      window.removeEventListener('touchmove', show);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="hint-banner" role="note" aria-live="polite">
      <div className="hint-banner__top">
        <button
          className="hint-banner__close"
          onClick={dismiss}
          aria-label="Hinweis schließen"
          type="button"
        >
          ✕
        </button>
      </div>
      <p className="hint-banner__text">
        Diese Seite respektiert Ihre Privatsphäre vollständig — es gibt kein Tracking,
        keine Analyse-Tools und keine Drittanbieter-Cookies. Lediglich Ihre Theme-Einstellung
        wird lokal in Ihrem Browser gespeichert.{' '}
        <Link to="/datenschutz" className="hint-banner__link" onClick={dismiss}>
          Zur Datenschutzerklärung →
        </Link>
      </p>
    </div>
  );
}
