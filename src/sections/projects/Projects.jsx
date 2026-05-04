import { useState, useEffect } from 'react';
import { IoChevronBack, IoChevronForward, IoOpenOutline } from 'react-icons/io5';
import { FiGithub } from 'react-icons/fi';
import { projectsData } from './projectsData.js';
import { formatCounter } from './projectsUtils.js';
import { useProjectsAnim } from './useProjectsAnim.js';
import BrowserPreview from './components/BrowserPreview/BrowserPreview.jsx';
import MobileView from './components/MobileView/MobileView.jsx';
import MobileFullscreen from './components/MobileView/MobileFullscreen.jsx';
import './projects.css';

function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(null);  // null = kein Wechsel, 1 = next, -1 = prev
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );
  const dataAnim = useProjectsAnim();

  // WÃ¤hrend Section-Entry-Animation: data-dir maskieren, damit data-anim="enter-*"
  // nicht durch [data-dir] Ã¼berschrieben wird (sonst CSS-Neustart-Flash).
  const effectiveDirection =
    dataAnim === 'enter-fwd' || dataAnim === 'enter-bwd' ? null : direction;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const total = projectsData.length;

  function switchProject(newIndex) {
    if (!total) return;
    const normalized = ((newIndex % total) + total) % total;
    if (normalized === activeIndex) return;
    const diff = (normalized - activeIndex + total) % total;
    setDirection(diff <= total / 2 ? 1 : -1);
    setActiveIndex(normalized);
    setIframeLoaded(false);
  }

  if (!total) return null;

  const activeProject = projectsData[activeIndex];
  const counter = formatCounter(activeIndex, total);
  const navDisabled = total <= 1;

  if (isDesktop) {
    return (
      <div
        className="projects"
        data-anim={dataAnim || undefined}
        style={{ '--project-primary': activeProject.primaryColor }}
      >
        {/* TL */}
        <div className="q-tl">
          {/* Keyed: nur der Inhalt animiert beim Wechsel */}
          <div
            key={activeProject.id}
            className="q-tl__anim"
            data-dir={effectiveDirection}
          >
            <span className="proj-tag">{activeProject.category}</span>
            <p className="proj-desc">{activeProject.description}</p>
          </div>

          <div className="proj-nav">
            <button
              type="button"
              className="proj-nav-btn"
              onClick={() => switchProject(activeIndex - 1)}
              disabled={navDisabled}
              aria-label="Vorheriges Projekt"
              title="Vorheriges Projekt"
            >
              <IoChevronBack />
            </button>
            <button
              type="button"
              className="proj-nav-btn"
              onClick={() => switchProject(activeIndex + 1)}
              disabled={navDisabled}
              aria-label="NÃ¤chstes Projekt"
              title="NÃ¤chstes Projekt"
            >
              <IoChevronForward />
            </button>
          </div>
        </div>

        {/* Browser Preview */}
        <BrowserPreview
          project={activeProject}
          iframeLoaded={iframeLoaded}
          onIframeLoad={() => setIframeLoaded(true)}
        />

        {/* BL */}
        <div className="q-bl">
          <div
            key={activeProject.id}
            className="q-bl__anim"
            data-dir={effectiveDirection}
          >
            <span className="proj-count">{counter}</span>
            <h2 className="proj-title">{activeProject.title}</h2>
          </div>
        </div>

        {/* BR */}
        <div className="q-br">
          <div
            key={activeProject.id}
            className="q-br__anim"
            data-dir={effectiveDirection}
          >
            <div className="proj-stack">
              {activeProject.tech.map((t) => {
                const Icon = t.icon;
                return (
                  <span
                    key={t.name}
                    className="proj-badge"
                    style={{ '--badge-color': t.color }}
                  >
                    {Icon && <Icon className="proj-badge-icon" />}
                    {t.name}
                  </span>
                );
              })}
            </div>
            <div className="proj-links">
              <a
                href={activeProject.liveUrl || '#'}
                className={`proj-link proj-link--live${!activeProject.liveUrl ? ' proj-link--off' : ''}`}
                target={activeProject.liveUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-disabled={!activeProject.liveUrl}
              >
                Live Demo Ã¶ffnen&nbsp;<IoOpenOutline />
              </a>
              <a
                href={activeProject.githubUrl || '#'}
                className={`proj-link proj-link--code${!activeProject.githubUrl ? ' proj-link--off' : ''}`}
                target={activeProject.githubUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                aria-disabled={!activeProject.githubUrl}
              >
                <FiGithub />&nbsp;GitHub Repository
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="projects"
      data-anim={dataAnim || undefined}
      style={{ '--project-primary': activeProject.primaryColor }}
    >
      <MobileView
        project={activeProject}
        index={activeIndex}
        total={total}
        onSwitch={switchProject}
        onOpenFullscreen={() => setMobileFullscreen(true)}
      />
      {mobileFullscreen && (
        <MobileFullscreen
          project={activeProject}
          onClose={() => setMobileFullscreen(false)}
        />
      )}
    </div>
  );
}

export default Projects;
