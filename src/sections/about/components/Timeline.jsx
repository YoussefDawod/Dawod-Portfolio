import { useEffect, useRef, useState } from 'react';
import './timeline.css';

export default function Timeline({ sectionLabel, stations, visible = false }) {
  const trackRef = useRef(null);
  const [observedVisible, setObservedVisible] = useState(false);

  // `visible` prop (extern gesteuert) oder IntersectionObserver
  const isVisible = visible || observedVisible;

  useEffect(() => {
    // Wenn per Prop bereits sichtbar, keinen Observer anlegen
    if (visible) return;

    const el = trackRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setObservedVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

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
            <div className="timeline-card">
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
