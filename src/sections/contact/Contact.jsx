import { FaPaperPlane } from 'react-icons/fa';
import { header, info, socials, form } from './contactData.js';
import './contact.css';

function Contact() {
  return (
    <div className="contact-wrapper">
      <div className="contact-content">
        
        {/* Header Bereich */}
        <div className="contact-header">
          <h2 className="section-title">{header.title} <span className="highlight">{header.highlight}</span></h2>
          <p className="section-subtitle">{header.subtitle}</p>
        </div>

        <div className="contact-grid">
          {/* Linke Seite: Kontakt-Infos & Socials */}
          <div className="contact-card info-card">
            <div className="info-header">
              <h3>{info.heading}</h3>
              <div className="location-badge">
                <div className="pulse-dot"></div>
                <span>{info.location}</span>
              </div>
            </div>
            <p>{info.text}</p>
            
            <div className="social-links">
              {socials.map(({ icon: Icon, label, href, className }) => (
                <a key={label} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'} className={`social-btn ${className}`}>
                  <Icon /> <span>{label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Rechte Seite: Formular */}
          <div className="contact-card form-card">
            <form className="modern-form" onSubmit={(e) => e.preventDefault()}>
              {form.fields.map(({ id, type, label, rows }) => (
                <div className="input-group" key={id}>
                  {type === 'textarea' ? (
                    <textarea id={id} required placeholder=" " rows={rows}></textarea>
                  ) : (
                    <input type={type} id={id} required placeholder=" " autoComplete="off" />
                  )}
                  <label htmlFor={id}>{label}</label>
                  <div className="line"></div>
                </div>
              ))}

              <button type="submit" className="send-btn">
                <span>{form.submitLabel}</span>
                <FaPaperPlane className="icon" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Contact;
