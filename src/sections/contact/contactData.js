/* ================================================
   CONTACT DATA — Zentrale Inhaltsdatei für die Contact Section
   ================================================ */

import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export const header = {
  title: "Let's",
  highlight: 'Connect',
  subtitle: 'Haben Sie eine Idee oder ein Projekt? Lassen Sie uns gemeinsam etwas Großartiges entwickeln.',
};

export const info = {
  heading: 'Kontaktkanäle',
  location: 'Germany',
  text: 'Ich bin immer offen für spannende Gespräche über Webentwicklung, neue Technologien oder Projektanfragen.',
};

export const socials = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/YoussefDawod', className: 'github' },
  { icon: FaLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/youssef-dawod-203273215/', className: 'linkedin' },
  { icon: FaEnvelope, label: 'Email', href: 'mailto:youssefdawod93@gmail.com', className: 'email' },
];

export const form = {
  fields: [
    { id: 'name', type: 'text', label: 'Name' },
    { id: 'email', type: 'email', label: 'Email' },
    { id: 'message', type: 'textarea', label: 'Nachricht', rows: 4 },
  ],
  submitLabel: 'Nachricht Senden',
};
