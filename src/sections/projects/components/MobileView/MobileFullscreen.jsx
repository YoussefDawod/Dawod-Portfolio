import { useEffect, useCallback, useRef } from 'react';
import { IoClose, IoChevronBack, IoReload, IoOpenOutline } from 'react-icons/io5';
import IframeScaler from '../BrowserPreview/IframeScaler.jsx';
import './mobileFullscreen.css';

function getDomain(url) {
  if (!url) return '—';
  try { return new URL(url).hostname; } catch { return url; }
}

function MobileFullscreen({ project, onClose }) {
  const iframeRef = useRef(null);

  /* ESC schließt das Overlay */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBack = useCallback(() => {
    try { iframeRef.current?.contentWindow?.history.back(); } catch {}
  }, []);

  const handleReload = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (iframe) iframe.src = iframe.src;
    } catch {}
  }, []);

  const handleOpenInBrowser = useCallback(() => {
    if (project.liveUrl) window.open(project.liveUrl, '_blank', 'noopener');
  }, [project.liveUrl]);

  return (
    <div className="mfs-overlay" role="dialog" aria-label="Vollbild-Vorschau" aria-modal="true">
      {/* --- Top Bar ------------------------------------ */}
      <div className="mfs-topbar">
        <button className="mfs-close" onClick={onClose}><IoClose /> Schließen</button>
        <span className="mfs-url">{getDomain(project.liveUrl)}</span>
      </div>

      {/* --- Iframe ------------------------------------- */}
      <div className="mfs-content">
        <IframeScaler
          ref={iframeRef}
          project={project}
          onLoad={() => {}}
          isMobile={true}
        />
      </div>

      {/* --- Bottom Bar --------------------------------- */}
      <div className="mfs-bottombar">
        <button className="mfs-btn mfs-btn--ghost" onClick={handleBack}><IoChevronBack /> Zurück</button>
        <button className="mfs-btn mfs-btn--ghost" onClick={handleReload}><IoReload /> Neu laden</button>
        <button className="mfs-btn mfs-btn--primary" onClick={handleOpenInBrowser}>
          Öffnen <IoOpenOutline />
        </button>
      </div>
    </div>
  );
}

export default MobileFullscreen;
