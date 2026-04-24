/* ================================================
   ABOUT DATA — Zentrale Inhaltsdatei für die About Section
   ================================================

   Alle Texte, Icons, Farben und Strukturen werden
   hier gepflegt. Die Komponenten beziehen ihre Inhalte
   ausschließlich aus dieser Datei.
   ================================================ */

import {
  SiReact, SiJavascript, SiCss3, SiHtml5, SiBootstrap, SiTailwindcss,
  SiNodedotjs, SiExpress, SiMongodb,
  SiGit, SiLinux, SiNpm
} from 'react-icons/si';
import {
  TbBrush, TbShieldCheck, TbBulb, TbSparkles,
  TbBinaryTree, TbApi, TbLock, TbRefresh, TbWorld,
  TbFlame, TbHammer, TbRocket
} from 'react-icons/tb';

/* ---------- Header ---------- */
export const header = {
  label: '//Über mich',
  headline: <>Ich gestalte Web-Erlebnisse, denen man ansieht, dass ein <span className="highlight-brand">Mensch</span> dahinter steckt.</>,
  subtitle: 'Frontend Developer mit Fokus auf React, moderne UI-Architektur',
  text: [
    'Für mich ist Software kein anonymes Produkt, sondern ein Handwerk, das Liebe zum Detail und eine klare Vision erfordert.',
    'Mein Fokus liegt auf der Entwicklung schneller, barrierefreier und ästhetisch ansprechender Interfaces. Ich bin fest davon überzeugt, dass großartige Software dort entsteht, wo durchdachtes Design auf eine solide Architektur trifft.',
    'Jedes Projekt verdient eine saubere Implementierung und die Sorgfalt, die aus einer einfachen Idee ein digitales Erlebnis macht, das Grenzen überschreitet.',
  ],
};

/* ---------- Principles ---------- */
export const principles = [
  {
    number: '01',
    icon: TbBrush,
    title: 'Design trifft Code',
    description:
      'Interfaces sind lebendige Systeme, keine statischen Bilder. Ich denke in Zuständen, Übergängen und logischen Abläufen, um Design und Technik nahtlos zu verschmelzen.',
  },
  {
    number: '02',
    icon: TbShieldCheck,
    title: 'Qualität vor Tempo',
    description:
      'Wartbarkeit ist eine Entscheidung. Ich schreibe Code nicht nur für den Browser, sondern für Menschen. Sauberer, lesbarer Code ist für mich das Fundament für langlebige Produkte.',
  },
  {
    number: '03',
    icon: TbBulb,
    title: 'Evolution statt Routine',
    description:
      'Technologie steht nie still, und ich auch nicht. Mein Fokus liegt darauf, neue Konzepte nicht nur zu verstehen, sondern sie in echten Projekten wertstiftend einzusetzen.',
  },
];

/* ---------- Skill Groups ---------- */
export const skillGroups = [
  {
    name: 'Frontend — mein Zuhause',
    skills: [
      { name: 'React',        icon: SiReact,        color: '#61DAFB' },
      { name: 'JavaScript',   icon: SiJavascript,   color: '#F7DF1E' },
      { name: 'CSS / SCSS',   icon: SiCss3,         color: '#1572B6' },
      { name: 'HTML',         icon: SiHtml5,        color: '#E34F26' },
      { name: 'Tailwind CSS', icon: SiTailwindcss,  color: '#06B6D4' },
      { name: 'Bootstrap',    icon: SiBootstrap,    color: '#7952B3' },
      { name: 'DOM',          icon: TbBinaryTree,   color: null      },
    ],
  },
  {
    name: 'Backend — Das Fundament',
    skills: [
      { name: 'Node.js',         icon: SiNodedotjs, color: '#339933' },
      { name: 'Express',         icon: SiExpress,   color: null      },
      { name: 'MongoDB',         icon: SiMongodb,   color: '#47A248' },
      { name: 'REST APIs',       icon: TbApi,       color: null      },
      { name: 'Auth & Security', icon: TbLock,      color: null      },
    ],
  },
  {
    name: 'Tooling & Workflow',
    skills: [
      { name: 'Git & GitHub', icon: SiGit,     color: '#F05032' },
      { name: 'Linux',        icon: SiLinux,   color: '#FCC624' },
      { name: 'npm',          icon: SiNpm,     color: '#CB3837' },
      { name: 'Agile',        icon: TbRefresh, color: null      },
      { name: 'Englisch C1',  icon: TbWorld,   color: null      },
    ],
  },
];

/* ---------- AI Highlight ---------- */
export const aiHighlight = {
  icon: TbSparkles,
  title: 'Effizienz durch KI',
  text: 'Ich nutze KI-Tools als strategische Partner, um Routineaufgaben zu beschleunigen. Das gibt mir den Freiraum, mich auf das Wesentliche zu konzentrieren: Architektur, kreative Problemlösung und User Experience.',
};

/* ---------- Timeline ---------- */
export const timeline = {
  sectionLabel: 'Vom Code zum Handwerk',
  stations: [
    {
      id: 1,
      period: '2023',
      label: 'Der Funke',
      title: 'Das Fundament legen',
      text: 'Start der intensiven Ausbildung zum Web- & Softwareentwickler. Fokus auf die Core-Technologien des Webs.',
      icon: TbFlame,
      color: 'var(--brand)',
    },
    {
      id: 2,
      period: '2023 – 2025',
      label: 'Die Schmiede',
      title: 'Deep Dive · DCI Berlin',
      text: '1.400+ Stunden praxisnahe Entwicklung. Spezialisierung auf das MERN-Stack und moderne UI-Architekturen.',
      icon: TbHammer,
      color: 'var(--hi)',
    },
    {
      id: 3,
      period: 'Heute',
      label: 'Die Vision',
      title: 'Full-Stack Context, Frontend Focus',
      text: 'Verbindung von technischer Tiefe und Design-Verständnis als Freelancer/Developer.',
      icon: TbRocket,
      color: 'var(--brand)',
    },
  ],
};
