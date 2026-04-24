import { useRef, useState, useEffect, forwardRef } from 'react';
import './iframeScaler.css';

const DESKTOP_W = 1280;
const DESKTOP_H = 900;
const MOBILE_W  = 390;
const MOBILE_H  = 844;

const IframeScaler = forwardRef(function IframeScaler(
  { project, onLoad, isMobile = false, interactive = true },
  iframeRef
) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ scale: 1, nativeH: DESKTOP_H });
  const [visible, setVisible] = useState(false);
  const naturalW = isMobile ? MOBILE_W : DESKTOP_W;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        const s = width / naturalW;
        /* Native Höhe so setzen, dass der skalierte iframe den Container ausfüllt */
        const nH = Math.ceil(height / s);
        setDims({ scale: s, nativeH: nH });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [naturalW]);

  /*
   * Iframe-src erst setzen, wenn der Container sichtbar wird.
   * → Verhindert, dass ein Cookie-Banner o. Ä. beim Seiten-Laden
   *   focus() aufruft und die Seite zum iframe scrollt.
   */
  useEffect(() => {
    if (!containerRef.current || !project.liveUrl) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { rootMargin: '200px' }
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, [project.liveUrl]);

  return (
    <div ref={containerRef} className="iframe-scaler">
      {project.liveUrl ? (
        <iframe
          ref={iframeRef}
          src={visible ? project.liveUrl : undefined}
          title={`Live Preview: ${project.title}`}
          sandbox="allow-scripts allow-forms allow-popups"
          loading="lazy"
          tabIndex={-1}
          style={{
            width: naturalW,
            height: dims.nativeH,
            transform: `scale(${dims.scale})`,
            transformOrigin: 'top left',
            border: 'none',
            display: 'block',
            pointerEvents: interactive ? 'all' : 'none',
          }}
          onLoad={onLoad}
        />
      ) : (
        <div
          className="iframe-placeholder"
          style={{ '--project-primary': project.primaryColor }}
        >
          <span className="iframe-placeholder-label">Live Preview</span>
          <span className="iframe-placeholder-sub">folgt in Kürze</span>
        </div>
      )}
    </div>
  );
});

export default IframeScaler;
