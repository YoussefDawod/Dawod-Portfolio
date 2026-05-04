import { useRef, useCallback, useEffect, useState } from 'react';
import SectionHeader from './components/SectionHeader';
import PrinciplesCard from './components/PrinciplesCard';
import SkillGroup from './components/SkillGroup';
import AIHighlight from './components/AIHighlight';
import Timeline from './components/Timeline';
import {
  header,
  principles,
  skillGroups,
  aiHighlight,
  timeline,
} from './aboutData';
import './about.css';

const DESKTOP_MQ = '(min-width: 1025px)';
const SLIDE_COUNT = 4;
const SLIDE_LABELS = ['Einleitung', 'Werdegang', 'Prinzipien', 'Stack & KI'];

/* Liefert das State-Token pro Slide für CSS-State-Driven-Animations.
   - "active": gerade sichtbar
   - "prev"  : liegt links vom aktiven Slide → Inhalte sind nach links rausgeglitten
   - "next"  : liegt rechts vom aktiven Slide → Inhalte warten rechts offstage
   Der Übergang zwischen diesen States interpoliert via CSS-Transitions —
   damit haben wir automatisch eine richtige Vor- UND Rückwärts-Animation. */
const slideStateOf = (idx, active) => {
  if (idx === active) return 'active';
  return idx < active ? 'prev' : 'next';
};

function About() {
  const aboutRef      = useRef(null);
  const trackRef      = useRef(null);
  const slideIndex    = useRef(0);
  const transitioning = useRef(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches
  );

  /* Desktop/Mobile reaktiv über matchMedia. */
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const goTo = useCallback((next) => {
    if (transitioning.current) return false;
    if (next < 0 || next > SLIDE_COUNT - 1) return false;
    if (next === slideIndex.current) return false;
    transitioning.current = true;
    /* BGS-Sync: Richtung des Slide-Wechsels feuern, damit der Background-Loop
       die Tokens in die Gegenrichtung beschleunigen kann (Parallax-Kick). */
    const direction = next > slideIndex.current ? 1 : -1;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('about-slide-change', { detail: { direction } }));
    }
    slideIndex.current = next;
    setActiveSlide(next);
    if (trackRef.current && isDesktop) {
      trackRef.current.style.transform = `translateX(calc(${-next} * 100vw))`;
    }
    setTimeout(() => { transitioning.current = false; }, 700);
    return true;
  }, [isDesktop]);

  /* Mobile/Desktop-Wechsel: Track-Transform aktualisieren bzw. zurücksetzen. */
  useEffect(() => {
    if (!trackRef.current) return;
    if (isDesktop) {
      trackRef.current.style.transform = `translateX(calc(${-slideIndex.current} * 100vw))`;
    } else {
      trackRef.current.style.transform = '';
    }
  }, [isDesktop]);

  /* Wheel → horizontale Slides (nur Desktop) */
  useEffect(() => {
    const el = aboutRef.current;
    if (!el || !isDesktop) return;
    const onWheel = (e) => {
      if (transitioning.current) { e.preventDefault(); return; }
      const dir = e.deltaY > 0 ? 1 : -1;
      const moved = goTo(slideIndex.current + dir);
      if (moved) e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goTo, isDesktop]);

  /* Tastatur → Pfeiltasten links/rechts (nur Desktop) */
  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (goTo(slideIndex.current + dir)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, isDesktop]);

  /* State-Tokens für die 4 Slides — CSS reagiert darauf via [data-state="..."]. */
  const s = (i) => slideStateOf(i, activeSlide);

  return (
    <div className="about" ref={aboutRef}>
      <div className="about-track" ref={trackRef}>

        {/* Slide 1 — Einleitung */}
        <div className="about-slide about-slide--header" data-state={s(0)}>
          <div className="about-slide__inner">
            <div className="about-slide__body">
              <SectionHeader {...header} />
            </div>
          </div>
        </div>

        {/* Slide 2 — Werdegang (Timeline isoliert) */}
        <div className="about-slide about-slide--timeline" data-state={s(1)}>
          <div className="about-slide__inner about-slide__inner--narrow">
            <header className="about-slide__head">
              <span className="about-slide__eyebrow">// Werdegang</span>
              <h2 className="about-slide__title">Vom Code zum Handwerk</h2>
            </header>
            <div className="about-slide__body">
              <Timeline {...timeline} sectionLabel={null} visible={activeSlide === 1} />
            </div>
          </div>
        </div>

        {/* Slide 3 — Prinzipien */}
        <div className="about-slide about-slide--principles" data-state={s(2)}>
          <div className="about-slide__inner">
            <header className="about-slide__head">
              <span className="about-slide__eyebrow">// Prinzipien</span>
              <h2 className="about-slide__title">Wie ich denke und arbeite</h2>
            </header>
            <div className="about-principles about-slide__body">
              {principles.map((p, i) => (
                <div key={p.number} style={{ '--stagger': i + 1 }}>
                  <PrinciplesCard {...p} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide 4 — Stack & KI */}
        <div className="about-slide about-slide--stack" data-state={s(3)}>
          <div className="about-slide__inner">
            <header className="about-slide__head">
              <span className="about-slide__eyebrow">// Stack &amp; KI</span>
              <h2 className="about-slide__title">Werkzeuge mit Haltung</h2>
            </header>
            <div className="about-skills about-slide__body">
              {skillGroups.map((group, i) => (
                <div key={group.name} style={{ '--stagger': i + 1 }}>
                  <SkillGroup {...group} />
                </div>
              ))}
            </div>
            <div className="about-ai" style={{ '--stagger': 4 }}>
              <AIHighlight {...aiHighlight} />
            </div>
          </div>
        </div>

      </div>

      <nav className="about-dots" aria-label="About Abschnitte">
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={label}
            className={`about-dot${activeSlide === i ? ' about-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={label}
            aria-current={activeSlide === i ? 'true' : undefined}
          />
        ))}
      </nav>
    </div>
  );
}

export default About;
