import { useEffect, useRef, useState } from 'react';
import './timeline.css';

export default function Timeline({ sectionLabel, stations }) {
  const trackRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="timeline">
      {sectionLabel && (
        <h3 className="timeline-section-label">{sectionLabel}</h3>
      )}
      <div
        className={`timeline-track ${isVisible ? 'timeline-visible' : ''}`}
        ref={trackRef}
      >
        {stations.map((station, i) => (
          <div
            className="timeline-station"
            key={station.id}
            style={{
              '--station-color': station.color,
              '--station-index': i,
            }}
          >
            <div className="timeline-icon-wrap">
              <station.icon className="timeline-icon" />
            </div>
            <div className="timeline-card glass-card">
              <span className="timeline-period">{station.period}</span>
              <span className="timeline-label">{station.label}</span>
              <h4 className="timeline-title">{station.title}</h4>
              <p className="timeline-text">{station.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
