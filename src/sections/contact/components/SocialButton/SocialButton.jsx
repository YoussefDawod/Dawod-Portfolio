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
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </a>
  );
}

export default SocialButton;
