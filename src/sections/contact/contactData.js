/* ================================================
   CONTACT DATA — Zentrale Inhaltsdatei
   ================================================ */

import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export const recipient = {
  email: 'dawod@yellowdeveloper.de',
};

export const header = {
  title: "Let's",
  highlight: 'Connect',
  subtitle:
    'Haben Sie eine Idee oder ein Projekt? Lassen Sie uns gemeinsam etwas Großartiges entwickeln.',
};

export const info = {
  heading: 'Kontaktkanäle',
  location: 'Germany',
  text: 'Ich bin immer offen für spannende Gespräche über Webentwicklung, neue Technologien oder Projektanfragen.',
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
 * `accent` referenziert eine CSS-Variable aus styles/colors.css —
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
        : 'Bitte eine gültige Email-Adresse.',
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
 * `linkHref` jetzt Platzhalter — bei fertiger Datenschutzseite anpassen.
 */
export const consentField = {
  id: 'consent',
  label: 'Ich stimme der Verarbeitung meiner personenbezogenen Daten gemäß der\u00A0',
  linkText: 'Datenschutzerklärung',
  linkHref: '/datenschutz',
  labelEnd: '\u00A0zu.*',
  footnote: '* Daten werden ausschließlich zur Beantwortung Ihrer Anfrage verwendet.',
  errorText: 'Bitte akzeptiere die Datenschutzerklärung.',
};

export const submitText = {
  idleLabel: 'Nachricht Senden',
  sendingLabel: 'Wird gesendet …',
  successToast: 'Nachricht gesendet — vielen Dank!',
  errorToast: 'Senden fehlgeschlagen. Bitte später erneut versuchen.',
  validationToast: 'Bitte prüfe die markierten Felder.',
};

/**
 * Web3Forms Endpoint. Access-Key kommt aus der Env-Var
 * VITE_WEB3FORMS_KEY (siehe .env.example).
 */
export const web3forms = {
  endpoint: 'https://api.web3forms.com/submit',
  accessKey: import.meta.env.VITE_WEB3FORMS_KEY ?? '',
  subject: 'Neue Nachricht über Portfolio',
  fromName: 'Portfolio Kontaktformular',
};
