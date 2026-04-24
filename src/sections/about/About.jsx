import { useEffect, useRef } from 'react';
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

function About() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const principlesRef = useRef(null);
  const aiRef = useRef(null);
  const skillsRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    const blocks = [headerRef, principlesRef, aiRef, skillsRef, timelineRef];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('block-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    blocks.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about" ref={sectionRef}>
      {/* Dot-Grid Background */}
      <div className="about-dot-grid" />

      {/* Block 1: Einleitung */}
      <div ref={headerRef}>
        <SectionHeader {...header} />
      </div>

      {/* Block 2: Drei Kernprinzipien */}
      <div className="about-principles" ref={principlesRef}>
        {principles.map((p, i) => (
          <div key={p.number} style={{ '--stagger': i }}>
            <PrinciplesCard {...p} />
          </div>
        ))}
      </div>

      {/* Block 3: AI-Augmented Development */}
      <div className="about-ai" ref={aiRef}>
        <AIHighlight {...aiHighlight} />
      </div>

      {/* Block 4: Fachliche Schwerpunkte */}
      <div className="about-skills" ref={skillsRef}>
        {skillGroups.map((group, i) => (
          <div key={group.name} style={{ '--stagger': i }}>
            <SkillGroup {...group} />
          </div>
        ))}
      </div>

      {/* Block 5: Timeline */}
      <div ref={timelineRef}>
        <Timeline {...timeline} />
      </div>
    </div>
  );
}

export default About;
