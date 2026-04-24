import { useRef } from 'react';
import { IoOpenOutline } from 'react-icons/io5';
import { FiGithub } from 'react-icons/fi';
import { useSwipe } from './useSwipe.js';
import IframeScaler from '../BrowserPreview/IframeScaler.jsx';
import './mobileView.css';

function getDomain(url) {
  if (!url) return '—';
  try { return new URL(url).hostname; } catch { return url; }
}

function MobileView({ project, index, total, onSwitch, onOpenFullscreen }) {
  const swipeRef = useRef(null);
  const counter = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  useSwipe(swipeRef, {
    onSwipeLeft:  () => onSwitch(index + 1),
    onSwipeRight: () => onSwitch(index - 1),
  });

  return (
    <div className="mobile-view" ref={swipeRef}>

      {/* --- Scrollable Content ------------------------- */}
      <div className="mobile-scroll">

        {/* Category + Counter */}
        <div className="mobile-category-row">
          <span className="mobile-category">{project.category}</span>
          <span className="mobile-counter">{counter}</span>
        </div>
        <h2 className="mobile-title">{project.title}</h2>

        {/* Tech Badges */}
        <div className="mobile-badges">
          {project.tech.map((t) => {
            const Icon = t.icon;
            return (
              <span key={t.name} className="mobile-badge" style={{ '--badge-color': t.color }}>
                {Icon && <Icon className="mobile-badge-icon" />}
                {t.name}
              </span>
            );
          })}
        </div>

        {/* Preview Thumbnail */}
        <div
          className="mobile-preview"
          onClick={project.liveUrl ? onOpenFullscreen : undefined}
          role={project.liveUrl ? 'button' : undefined}
          aria-label={project.liveUrl ? 'Vollbild-Preview öffnen' : undefined}
          tabIndex={project.liveUrl ? 0 : undefined}
        >
          <div className="mobile-preview-bar">
            <span className="mobile-preview-url">{getDomain(project.liveUrl)}</span>
            {project.liveUrl && <span className="mobile-preview-live">LIVE</span>}
          </div>
          <div className="mobile-preview-frame">
            <IframeScaler project={project} onLoad={() => {}} isMobile={false} interactive={false} />
          </div>
          {project.liveUrl && (
            <div className="mobile-preview-hint">
              <span className="mobile-hint-dot" />
              Tippen für Vollbild
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mobile-desc">{project.description}</p>

        {/* Links */}
        <div className="mobile-links">
          <a
            href={project.liveUrl || '#'}
            className={`mobile-link mobile-link--primary${!project.liveUrl ? ' mobile-link--disabled' : ''}`}
            target={project.liveUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            aria-disabled={!project.liveUrl}
          >
            Live Demo öffnen&nbsp;<IoOpenOutline />
          </a>
          <a
            href={project.githubUrl || '#'}
            className={`mobile-link mobile-link--secondary${!project.githubUrl ? ' mobile-link--disabled' : ''}`}
            target={project.githubUrl ? '_blank' : undefined}
            rel="noopener noreferrer"
            aria-disabled={!project.githubUrl}
          >
            <FiGithub />&nbsp;GitHub
          </a>
        </div>
      </div>

      {/* --- Dots Navigation ---------------------------- */}
      <div className="mobile-dots" role="tablist" aria-label="Projekt auswählen">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={`mobile-dot${i === index ? ' is-active' : ''}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Projekt ${i + 1}`}
            onClick={() => onSwitch(i)}
          />
        ))}
      </div>
    </div>
  );
}

export default MobileView;
