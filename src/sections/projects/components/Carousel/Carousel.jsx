import { useRef, useMemo, useEffect, useCallback } from 'react';
import CarouselCard from './CarouselCard.jsx';
import './carousel.css';

/* Card-Breite + Gap in px — muss zu carouselCard.css passen */
const CARD_W = 400;
const GAP    = 16;
const SPEED  = 0.3; // px pro Frame (~24 px/s bei 60 fps)

function Carousel({ projects, activeIndex, onSelect }) {
  const trackRef  = useRef(null);
  const offsetRef = useRef(0);
  const rafRef    = useRef(null);
  const paused    = useRef(false);

  /* 3× klonen für lückenlose Abdeckung auch bei breiten Viewports */
  const cloned = useMemo(
    () => [...projects, ...projects, ...projects],
    [projects]
  );

  /* Breite eines vollständigen Sets (inkl. abschließendem Gap) */
  const setWidth = projects.length * (CARD_W + GAP);

  /* --- Animation Loop ---------------------------------- */
  useEffect(() => {
    function tick() {
      if (!paused.current) {
        offsetRef.current -= SPEED;
        /* Sobald ein ganzes Set durchgescrollt ist → Position zurücksetzen */
        if (Math.abs(offsetRef.current) >= setWidth) {
          offsetRef.current += setWidth;
        }
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setWidth]);

  const handleEnter = useCallback(() => { paused.current = true; }, []);
  const handleLeave = useCallback(() => { paused.current = false; }, []);

  return (
    <div
      className="carousel-wrap"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Gradient-Fades links und rechts */}
      <div className="carousel-fade carousel-fade--left"  aria-hidden="true" />
      <div className="carousel-fade carousel-fade--right" aria-hidden="true" />

      <div
        className="carousel-track"
        ref={trackRef}
        role="tablist"
        aria-label="Projekt auswählen"
      >
        {cloned.map((project, i) => {
          const realIndex = i % projects.length;
          return (
            <CarouselCard
              key={`${project.id}-${i}`}
              project={project}
              isActive={realIndex === activeIndex}
              onClick={() => onSelect(realIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Carousel;
