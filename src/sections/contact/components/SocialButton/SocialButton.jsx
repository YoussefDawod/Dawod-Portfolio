import { FaArrowRight } from 'react-icons/fa';
import './socialButton.css';

/**
 * SocialButton — minimal hairline link mit Slide-Pfeil.
 * Kein Box-Look: nur Icon + Label + Pfeil auf Linie.
 */
function SocialButton({ icon: Icon, label, href }) {
  const isMail = href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noopener noreferrer'}
      className="social-link"
      aria-label={label}
    >
      <Icon className="social-link__icon" aria-hidden="true" />
      <span className="social-link__label">{label}</span>
      <FaArrowRight className="social-link__arrow" aria-hidden="true" />
    </a>
  );
}

export default SocialButton;
