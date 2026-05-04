import { useRef, useCallback } from 'react';
import { IoChevronBack, IoChevronForward, IoReload } from 'react-icons/io5';
import IframeScaler from './IframeScaler.jsx';
import { getDomain } from '../../projectsUtils.js';
import './browserPreview.css';

function BrowserPreview({ project, iframeLoaded, onIframeLoad }) {
  const iframeRef = useRef(null);
  const domain = getDomain(project.liveUrl);

  const handleBack = useCallback(() => {
    try { iframeRef.current?.contentWindow?.history.back(); } catch { /* cross-origin: noop */ }
  }, []);

  const handleForward = useCallback(() => {
    try { iframeRef.current?.contentWindow?.history.forward(); } catch { /* cross-origin: noop */ }
  }, []);

  const handleReload = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (iframe) { const src = iframe.src; iframe.src = src; }
    } catch { /* cross-origin: noop */ }
  }, []);

  return (
    <div
      className="browser-preview"
      style={{ '--project-primary': project.primaryColor }}
    >
      <div className="browser-frame">
        {/* Project-Wechsel löst durch key-basierten Remount eine kurze
            farbige Pulse-Animation aus — der iframe darunter bleibt stabil. */}
        <span key={project.id} className="browser-frame__pulse" aria-hidden="true" />

        <div className="browser-toolbar">
          <div className="browser-nav">
            <button
              className="browser-nav-btn"
              onClick={handleBack}
              aria-label="Zurück"
              title="Zurück"
            ><IoChevronBack /></button>
            <button
              className="browser-nav-btn"
              onClick={handleForward}
              aria-label="Vorwärts"
              title="Vorwärts"
            ><IoChevronForward /></button>
            <button
              className="browser-nav-btn"
              onClick={handleReload}
              aria-label="Neu laden"
              title="Neu laden"
            ><IoReload /></button>
          </div>
          <div className="browser-url">{domain}</div>
        </div>

        <div className="browser-content">
          <IframeScaler
            ref={iframeRef}
            project={project}
            onLoad={onIframeLoad}
            isMobile={false}
          />

          {project.liveUrl && !iframeLoaded && (
            <div
              className="browser-skeleton"
              style={{ '--project-primary': project.primaryColor }}
              aria-hidden="true"
            >
              <div className="skeleton-line skeleton-line--wide" />
              <div className="skeleton-line skeleton-line--medium" />
              <div className="skeleton-line skeleton-line--short" />
              <div className="skeleton-block" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default BrowserPreview;
