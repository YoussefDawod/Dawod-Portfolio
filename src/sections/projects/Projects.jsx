import { useState, useEffect } from 'react';
import { projectsData } from './projectsData.js';
import InfoPanel from './components/InfoPanel/InfoPanel.jsx';
import BrowserPreview from './components/BrowserPreview/BrowserPreview.jsx';
import Carousel from './components/Carousel/Carousel.jsx';
import MobileView from './components/MobileView/MobileView.jsx';
import MobileFullscreen from './components/MobileView/MobileFullscreen.jsx';
import './projects.css';

function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [mobileFullscreen, setMobileFullscreen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const activeProject = projectsData[activeIndex];

  function switchProject(newIndex) {
    if (isTransitioning || newIndex === activeIndex || !projectsData.length) return;
    const normalized =
      ((newIndex % projectsData.length) + projectsData.length) % projectsData.length;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(normalized);
      setIframeLoaded(false);
      setTimeout(() => setIsTransitioning(false), 20);
    }, 150);
  }

  if (!projectsData.length) return null;

  if (isDesktop) {
    return (
      <div className="projects">
        <div className="projects-main">
          <InfoPanel
            project={activeProject}
            index={activeIndex}
            total={projectsData.length}
            isLeaving={isTransitioning}
          />
          <BrowserPreview
            project={activeProject}
            iframeLoaded={iframeLoaded}
            onIframeLoad={() => setIframeLoaded(true)}
            isLeaving={isTransitioning}
          />
        </div>
        <Carousel
          projects={projectsData}
          activeIndex={activeIndex}
          onSelect={switchProject}
        />
      </div>
    );
  }

  return (
    <div className="projects">
      <MobileView
        project={activeProject}
        index={activeIndex}
        total={projectsData.length}
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
