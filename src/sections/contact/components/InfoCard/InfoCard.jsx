import LocationBadge from '../LocationBadge/LocationBadge.jsx';
import SocialButton from '../SocialButton/SocialButton.jsx';
import './infoCard.css';

function InfoCard({
  heading,
  location,
  text,
  socials,
  eyebrow = 'Get in touch',
  socialsLabel = 'Folgen Sie mir',
}) {
  return (
    <article className="contact-card info-card">
      <span className="info-card__watermark" aria-hidden="true">YD</span>

      <header className="info-card__header">
        <span className="info-card__eyebrow">{eyebrow}</span>
        <h3 className="info-card__heading">{heading}</h3>
        <LocationBadge label={location} />
      </header>

      <p className="info-card__text">{text}</p>

      <hr className="info-card__divider" />

      <div>
        <p className="info-card__socials-label">{socialsLabel}</p>
        <ul className="info-card__socials" aria-label="Soziale Kontakte">
          {socials.map((s) => (
            <li key={s.label}>
              <SocialButton {...s} />
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default InfoCard;
