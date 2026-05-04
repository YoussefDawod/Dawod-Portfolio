import { Link } from 'react-router-dom';
import { header, info, socials } from './contactData.js';
import InfoColumn from './components/InfoColumn/InfoColumn.jsx';
import ContactForm from './components/ContactForm/ContactForm.jsx';
import { useReveal } from '../../shared/hooks/useReveal.js';
import { useContactAnim } from './useContactAnim.js';
import './contact.css';

/**
 * Contact-Section — editorial, premium.
 * Das große YD wird vom BGS-Canvas im Hintergrund gerendert ("YD Signal Field").
 * Hier nur Inhalt + Reveal-Choreografie.
 */
function Contact() {
  const { ref: rootRef, isVisible } = useReveal({ threshold: 0.15, once: true });
  const dataAnim = useContactAnim();

  return (
    <div
      className="contact"
      ref={rootRef}
      data-revealed={isVisible}
      data-anim={dataAnim || undefined}
    >
      <div className="contact__inner">
        {/* Header */}
        <header className="contact__header">
          <h2 className="contact__title">
            <span className="contact__title-word reveal" style={{ '--reveal-delay': '120ms' }}>
              {header.title}
            </span>{' '}
            <span
              className="contact__title-highlight reveal"
              data-text={header.highlight}
              style={{ '--reveal-delay': '260ms' }}
            >
              {header.highlight}
            </span>
          </h2>
          <span className="contact__rule reveal" style={{ '--reveal-delay': '380ms' }} aria-hidden="true" />
        </header>

        {/* Asymmetrisches Layout — Goldener Schnitt */}
        <div className="contact__grid">
          <div className="contact__column reveal" style={{ '--reveal-delay': '460ms' }}>
            <InfoColumn
              heading={info.heading}
              location={info.location}
              text={info.text}
              socials={socials}
            />
          </div>
          <div className="contact__column reveal" style={{ '--reveal-delay': '600ms' }}>
            <ContactForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="contact__footer">
          <span className="contact__footer-copy">
            &copy; {new Date().getFullYear()} Youssef Dawod
          </span>
          <nav className="contact__footer-nav" aria-label="Rechtliche Seiten">
            <Link to="/impressum">Impressum</Link>
            <Link to="/datenschutz">Datenschutz</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}

export default Contact;
