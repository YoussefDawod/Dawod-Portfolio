import LocationBadge from '../LocationBadge/LocationBadge.jsx';
import SocialButton from '../SocialButton/SocialButton.jsx';
import './infoColumn.css';

/**
 * InfoColumn — linke Spalte des Editorial-Layouts.
 * Kein Card-Wrapper. Nur Typografie + Whitespace.
 */
function InfoColumn({
  heading,
  location,
  text,
  socials,
  eyebrow = 'Get in touch',
  socialsLabel = 'Folge mir',
}) {
  return (
    <section className="info-col" aria-labelledby="info-col-heading">
      <span className="info-col__eyebrow reveal" style={{ '--reveal-delay': '500ms' }}>
        {eyebrow}
      </span>

      <h3
        id="info-col-heading"
        className="info-col__heading reveal"
        style={{ '--reveal-delay': '560ms' }}
      >
        {heading}
      </h3>

      <p className="info-col__text reveal" style={{ '--reveal-delay': '620ms' }}>
        {text}
      </p>

      <div className="info-col__location reveal" style={{ '--reveal-delay': '680ms' }}>
        <LocationBadge label={location} />
      </div>

      <div className="info-col__socials-wrap reveal" style={{ '--reveal-delay': '760ms' }}>
        <span className="info-col__socials-label">{socialsLabel}</span>
        <ul className="info-col__socials" aria-label="Soziale Kontakte">
          {socials.map((s) => (
            <li key={s.label}>
              <SocialButton {...s} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default InfoColumn;
