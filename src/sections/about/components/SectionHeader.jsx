import './sectionHeader.css';

export default function SectionHeader({headline, subtitle, text }) {
  return (
    <div className="section-header">
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <h2 className="section-headline">{headline}</h2>
      
      {Array.isArray(text)
        ? text.map((paragraph, i) => (
            <p key={i} className="section-text">{paragraph}</p>
          ))
        : text && <p className="section-text">{text}</p>
      }
    </div>
  );
}
