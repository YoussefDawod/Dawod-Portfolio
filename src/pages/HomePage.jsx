import { useLayoutEffect, useEffect } from 'react';
import Navbar from '../shared/Navbar/Navbar.jsx';
import Home from '../sections/home/Home.jsx';
import About from '../sections/about/About.jsx';
import Projects from '../sections/projects/Projects.jsx';
import Contact from '../sections/contact/Contact.jsx';
import { usePageSnap } from '../shared/hooks/usePageSnap.js';

const SECTION_IDS = ['home', 'about', 'projects', 'contact'];

/**
 * HomePage — One-Page-Komposition mit Infinite-Loop-Scroll.
 *
 * DOM-Reihenfolge (Desktop):
 *   [ghost-contact] → #home → #about → #projects → #contact → [ghost-home]
 *
 * Ghost-Sections sind visuelle Kopien der ersten/letzten Section.
 * Sie ermöglichen nahtloses Sliding beim Wrap-Around ohne Fade-Effekt.
 * Kein id, kein data-section → BGS-System und Navbar ignorieren sie.
 * Auf Mobile per CSS ausgeblendet (display: none).
 */
export default function HomePage() {
  usePageSnap(SECTION_IDS);

  // Desktop: Scroll direkt zu echtem Home starten (unter ghost-contact)
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (window.innerWidth > 1024) {
      // Gespeicherten Section-Index wiederherstellen
      const savedIdx = parseInt(sessionStorage.getItem('sectionIndex') ?? '0', 10);
      // offsetTop kann erst nach dem ersten Paint sicher gelesen werden;
      // window.innerHeight × (idx + 1) ist auf Desktop exakt korrekt
      // da alle Sections height: 100dvh haben und ghost-contact vorne ist
      window.scrollTo({ top: window.innerHeight * (savedIdx + 1), behavior: 'instant' });
    } else {
      const saved = sessionStorage.getItem('scrollY');
      if (saved) window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
    }
  }, []);

  // Section-Index / ScrollY speichern
  useEffect(() => {
    const save = () => {
      if (window.innerWidth > 1024) {
        const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
        const mid = window.scrollY + window.innerHeight / 2;
        let idx = 0;
        sections.forEach((s, i) => { if (mid >= s.offsetTop) idx = i; });
        sessionStorage.setItem('sectionIndex', String(idx));
      } else {
        sessionStorage.setItem('scrollY', String(window.scrollY));
      }
    };
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, []);

  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {/* Ghost: Contact vor Home — für nahtlosen Wrap Home → Contact */}
        <section className="ghost-section" aria-hidden="true" inert={true}>
          <Contact />
        </section>

        {/* Echte Sections */}
        <section id="home"     data-section="YD"><Home /></section>
        <section id="about"    data-section="ABOUT"><About /></section>
        <section id="projects" data-section="PROJECTS"><Projects /></section>
        <section id="contact"  data-section="CONTACT"><Contact /></section>

        {/* Ghost: Home nach Contact — für nahtlosen Wrap Contact → Home */}
        <section className="ghost-section" aria-hidden="true" inert={true}>
          <Home />
        </section>
      </main>
    </>
  );
}
