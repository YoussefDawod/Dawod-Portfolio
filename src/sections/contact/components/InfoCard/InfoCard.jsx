import LocationBadge from '../LocationBadge/LocationBadge.jsx';
import SocialButton from '../SocialButton/SocialButton.jsx';
import './infoCard.css';

function InfoCard({ heading, location, text, socials }) {
  return (
    <article className="contact-card info-card">
      <header className="info-card__header">
        <h3 className="info-card__heading">{heading}</h3>
        <LocationBadge label={location} />
      </header>

      <p className="info-card__text">{text}</p>

      <ul className="info-card__socials" aria-label="Soziale Kontakte">
        {socials.map((s) => (
          <li key={s.label}>
            <SocialButton {...s} />
          </li>
        ))}
      </ul>
    </article>
  );
}

export default InfoCard;
