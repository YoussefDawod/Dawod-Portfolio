import { header, info, socials } from './contactData.js';
import InfoCard from './components/InfoCard/InfoCard.jsx';
import ContactForm from './components/ContactForm/ContactForm.jsx';
import './contact.css';

function Contact() {
  return (
    <div className="contact-wrapper">
      <div className="contact-content">
        <header className="contact-header">
          <h2 className="contact-header__title">
            {header.title}{' '}
            <span className="contact-header__highlight" data-text={header.highlight}>
              {header.highlight}
            </span>
          </h2>
          <p className="contact-header__subtitle">{header.subtitle}</p>
        </header>

        <div className="contact-grid">
          <InfoCard
            heading={info.heading}
            location={info.location}
            text={info.text}
            socials={socials}
          />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

export default Contact;
