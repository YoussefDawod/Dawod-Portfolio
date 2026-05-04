/* ================================================
   CONTACT DATA â€” Zentrale Inhaltsdatei
   ================================================ */

import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

const recipient = {
  email: 'dawod@yellowdeveloper.de',
};

export const header = {
  title: "Let's",
  highlight: 'Connect',
};

export const info = {
  heading: 'KontaktkanÃ¤le',
  location: 'Germany',
  text: 'Ich bin aktiv auf Jobsuche und freue mich Ã¼ber Anfragen zu Festanstellungen, Freelance-Projekten oder einem kurzen KennenlerngesprÃ¤ch.',
};

export const socials = [
  {
    icon: FaGithub,
    label: 'GitHub',
    href: 'https://github.com/YoussefDawod',
    className: 'github',
  },
  {
    icon: FaLinkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/youssef-dawod-203273215/',
    className: 'linkedin',
  },
  {
    icon: FaEnvelope,
    label: 'Email',
    href: `mailto:${recipient.email}`,
    className: 'email',
  },
];

/**
 * Form-Felder mit Validierungs-Regeln und Akzentfarben.
 * `accent` referenziert eine CSS-Variable aus styles/colors.css â€”
 * jedes Feld bekommt im Focus-State seine eigene Farbe.
 */
export const formFields = [
  {
    id: 'name',
    type: 'text',
    label: 'Name',
    autoComplete: 'name',
    accent: 'var(--field-name-accent)',
    validate: (v) => (v.trim().length >= 2 ? null : 'Bitte mindestens 2 Zeichen.'),
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email',
    autoComplete: 'email',
    accent: 'var(--field-email-accent)',
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
        ? null
        : 'Bitte eine gÃ¼ltige Email-Adresse.',
  },
  {
    id: 'message',
    type: 'textarea',
    label: 'Nachricht',
    rows: 4,
    maxLength: 1000,
    accent: 'var(--field-message-accent)',
    validate: (v) =>
      v.trim().length >= 10 ? null : 'Bitte mindestens 10 Zeichen.',
  },
];

/**
 * DSGVO-Einwilligungs-Checkbox.
 * `linkHref` jetzt Platzhalter â€” bei fertiger Datenschutzseite anpassen.
 */
export const consentField = {
  id: 'consent',
  label: 'Ich stimme der Verarbeitung meiner personenbezogenen Daten gemÃ¤ÃŸ der\u00A0',
  linkText: 'DatenschutzerklÃ¤rung',
  linkHref: '/datenschutz',
  labelEnd: '\u00A0zu.*',
  footnote: '* Daten werden ausschlieÃŸlich zur Beantwortung Ihrer Anfrage verwendet.',
  errorText: 'Bitte akzeptiere die DatenschutzerklÃ¤rung.',
};

export const submitText = {
  idleLabel: 'Nachricht Senden',
  sendingLabel: 'Wird gesendet â€¦',
  successToast: 'Nachricht gesendet â€” vielen Dank!',
  errorToast: 'Senden fehlgeschlagen. Bitte spÃ¤ter erneut versuchen.',
  validationToast: 'Bitte prÃ¼fe die markierten Felder.',
};

/**
 * Web3Forms Endpoint. Access-Key kommt aus der Env-Var
 * VITE_WEB3FORMS_KEY (siehe .env.example).
 */
export const web3forms = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.VITE_WEB3FORMS_KEY ?? '',
  subject: 'Neue Nachricht Ã¼ber Portfolio',
  fromName: 'Portfolio Kontaktformular',
};
