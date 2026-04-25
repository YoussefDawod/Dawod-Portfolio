import { FaArrowRight } from 'react-icons/fa';
import './socialButton.css';

function SocialButton({ icon: Icon, label, href, className = '' }) {
  const isMail = href.startsWith('mailto:');
  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noopener noreferrer'}
      className={`social-btn ${className}`.trim()}
      aria-label={label}
    >
      <Icon className="social-btn__icon" aria-hidden="true" />
      <span className="social-btn__label">{label}</span>
      <FaArrowRight className="social-btn__arrow" aria-hidden="true" />
    </a>
  );
}

export default SocialButton;
