import './sectionHeader.css';

export default function SectionHeader({ label, headline, subtitle, text }) {
  return (
    <div className="section-header">
      {label && <span className="section-label">{label}</span>}
      <h2 className="section-headline">{headline}</h2>
      {subtitle && (
        <p className="section-subtitle">
          <span className="section-subtitle__rule" aria-hidden="true" />
          {subtitle}
        </p>
      )}

      {Array.isArray(text) && text.length > 0 && (
        <div className="section-body">
          {text.map((paragraph, i) => (
            <p key={i} className="section-text">{paragraph}</p>
          ))}
        </div>
      )}
      {!Array.isArray(text) && text && (
        <div className="section-body">
          <p className="section-text">{text}</p>
        </div>
      )}
    </div>
  );
}
