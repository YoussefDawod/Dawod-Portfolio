/**
 * usePageSnap — JS-gesteuertes sanftes Scroll-Snapping (Infinite Loop)
 *
 * Infinite-Loop via Ghost-Sections:
 *   DOM-Reihenfolge:  [ghost-contact] [home] [about] [projects] [contact] [ghost-home]
 *   Wrap nach unten (Contact→Home):  animate zu ghost-home → instant jump zu real home
 *   Wrap nach oben  (Home→Contact):  animate zu ghost-contact → instant jump zu real contact
 *
 * Koordination:
 *   - Interne Komponenten (About, Carousel) rufen e.preventDefault() auf → Hook überspringt
 *   - Navbar-Navigation via Custom-Event 'page-snap-go'
 *   - Sendet 'page-section-change' für aktive Section
 *
 * Nur Desktop aktiv (> 1024px).
 */
import { useEffect, useRef, useCallback } from 'react';

const DURATION = 680;

function easeInOutQuart(t) {
  return t < 0.5
    ? 8 * t * t * t * t
    : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function animateScrollTo(targetY) {
  const startY    = window.scrollY;
  const startTime = performance.now();
  let raf;
  function tick(now) {
    const t = Math.min((now - startTime) / DURATION, 1);
    window.scrollTo(0, startY + (targetY - startY) * easeInOutQuart(t));
    if (t < 1) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export function usePageSnap(sectionIds) {
  const transitioning = useRef(false);
  const cancelAnim    = useRef(null);

  const getSections = useCallback(
    () => sectionIds.map(id => document.getElementById(id)).filter(Boolean),
    [sectionIds]
  );

  const getCurrentIndex = useCallback(() => {
    const sections = getSections();
    const mid = window.scrollY + window.innerHeight / 2;
    let idx = 0;
    sections.forEach((s, i) => { if (mid >= s.offsetTop) idx = i; });
    return idx;
  }, [getSections]);

  const goTo = useCallback(async (rawIndex) => {
    if (transitioning.current) return;
    const sections = getSections();
    const count    = sections.length;
    const vh       = window.innerHeight;

    transitioning.current = true;
    cancelAnim.current?.();

    // Ziel-Section ermitteln und SOFORT signalisieren — BEVOR der Sprung läuft.
    // Die BGS-Animation lauscht auf 'page-snap-start' und beginnt ihren
    // Übergang im selben Frame wie der Scroll-Sprung. So laufen Scroll-
    // Animation und BGS-Übergang synchron.
    let targetSectionId;
    if (rawIndex >= count) targetSectionId = sectionIds[0];
    else if (rawIndex < 0) targetSectionId = sectionIds[count - 1];
    else                   targetSectionId = sectionIds[rawIndex];
    window.dispatchEvent(new CustomEvent('page-snap-start', {
      detail: { id: targetSectionId, duration: DURATION }
    }));

    if (rawIndex >= count) {
      /* Wrap vorwarts: animate zu ghost-home (direkt unter letzter Section) */
      const ghostHomeY = sections[count - 1].offsetTop + vh;
      cancelAnim.current = animateScrollTo(ghostHomeY);
      await new Promise(r => setTimeout(r, DURATION + 40));
      window.scrollTo(0, sections[0].offsetTop);
      window.dispatchEvent(new CustomEvent('page-section-change', { detail: { id: sectionIds[0] } }));

    } else if (rawIndex < 0) {
      /* Wrap ruckwarts: animate zu ghost-contact (scrollY=0) */
      cancelAnim.current = animateScrollTo(0);
      await new Promise(r => setTimeout(r, DURATION + 40));
      window.scrollTo(0, sections[count - 1].offsetTop);
      window.dispatchEvent(new CustomEvent('page-section-change', { detail: { id: sectionIds[count - 1] } }));

    } else {
      /* Normaler Ubergang */
      cancelAnim.current = animateScrollTo(sections[rawIndex].offsetTop);
      await new Promise(r => setTimeout(r, DURATION + 40));
      window.dispatchEvent(new CustomEvent('page-section-change', { detail: { id: sectionIds[rawIndex] } }));
    }

    transitioning.current = false;
  }, [getSections, sectionIds]);

  /* Wheel-Handler */
  useEffect(() => {
    const onWheel = (e) => {
      if (window.innerWidth <= 1024) return;
      if (e.defaultPrevented) return;
      e.preventDefault();
      if (transitioning.current) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      goTo(getCurrentIndex() + dir);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo, getCurrentIndex]);

  /* Navbar-Navigation via Custom-Event */
  useEffect(() => {
    const handler = (e) => {
      const idx = sectionIds.indexOf(e.detail.id);
      if (idx !== -1) goTo(idx);
    };
    window.addEventListener('page-snap-go', handler);
    return () => window.removeEventListener('page-snap-go', handler);
  }, [sectionIds, goTo]);
}