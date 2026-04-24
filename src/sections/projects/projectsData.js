/* ================================================
   PROJECTS DATA — Zentrale Inhaltsdatei für die Projects Section
   ================================================

   Schema pro Projekt:
   ┌─────────────────┬───────────────────────────────────────────────────────┐
   │ id              │ Einzigartiger Slug (kebab-case)                       │
   │ num             │ Anzeige-Nummer als String: '01', '02', ...            │
   │ category        │ Kategorie-Label (Großbuchstaben), nur Mobile sichtbar │
   │ title           │ Projekt-Titel                                         │
   │ tech            │ Array von { name, icon, color } — wie aboutData       │
   │ description     │ Kurzbeschreibung, max 3 Sätze                         │
   │ primaryColor    │ Hex-Farbe passend zum Projekt/Stack (Thumbnail-Tint)  │
   │ liveUrl         │ https://... — Live Demo URL (null = deaktiviert)      │
   │ githubUrl       │ https://... — GitHub URL   (null = deaktiviert)       │
   └─────────────────┴───────────────────────────────────────────────────────┘

   Hinweis: liveUrl wird als iframe src verwendet. Das Hosting-Projekt muss
   X-Frame-Options erlauben. Solange null, wird ein Placeholder angezeigt.
================================================ */

import {
  SiReact, SiVite, SiSass, SiExpress, SiMongodb,
  SiTypescript, SiNextdotjs, SiTailwindcss,
  SiReactrouter, SiFramer,
} from 'react-icons/si';

export const projectsData = [
  {
    id:           'finora-smart-finance',
    num:          '01',
    category:     'FINANCE',
    title:        'Finora Smart Finance',
    tech:         [
      { name: 'React',   icon: SiReact,   color: '#61DAFB' },
      { name: 'Vite',    icon: SiVite,    color: '#646CFF' },
      { name: 'SCSS',    icon: SiSass,    color: '#CC6699' },
      { name: 'Express', icon: SiExpress, color: null      },
      { name: 'MongoDB', icon: SiMongodb, color: '#47A248' },
    ],
    description:
      'Finora ist eine moderne Web-App zur intelligenten Verwaltung von Einnahmen, ' +
      'Ausgaben und Budgets. Die Plattform kombiniert ein hochwertiges, mehrsprachiges ' +
      'Frontend mit Echtzeit-Analysen, PWA-Funktionen und einem abgesicherten Backend ' +
      'für Authentifizierung, Admin-Features und Finanzdatenverwaltung.',
    primaryColor: '#5B6CFF',
    liveUrl:      'https://finora.yellowdeveloper.de/',
    githubUrl:    'https://github.com/YoussefDawod/finora-smart-finance',
  },
  {
    id:           'momentum-produktivitaets-timer',
    num:          '02',
    category:     'PRODUCTIVITY',
    title:        'Momentum — Produktivitäts-Timer',
    tech:         [
      { name: 'React',        icon: SiReact,        color: '#61DAFB' },
      { name: 'Vite',         icon: SiVite,         color: '#646CFF' },
      { name: 'React Router', icon: SiReactrouter,  color: '#CA4245' },
    ],
    description:
      'Momentum ist ein Fokus-Timer auf Basis der Pomodoro-Technik mit konfigurierbaren ' +
      'Arbeitsphasen, automatischen Pausen und Live-Statistiken. Die App läuft vollständig ' +
      'offline als PWA, speichert Sessions lokal und visualisiert Produktivitäts-Streaks. ' +
      'Gebaut mit einem drift-freien Wall-Clock-Timer, der auch im Hintergrund-Tab korrekt läuft.',
    primaryColor: '#E07A5F',
    liveUrl:      'https://momentum.yellowdeveloper.de',
    githubUrl:    'https://github.com/YoussefDawod/Momentum',
  },
  {
    id:           'flavorfind',
    num:          '03',
    category:     'PWA',
    title:        'FlavorFind',
    tech:         [
      { name: 'React',        icon: SiReact,        color: '#61DAFB' },
      { name: 'Vite',         icon: SiVite,         color: '#646CFF' },
      { name: 'Tailwind',     icon: SiTailwindcss,  color: '#06B6D4' },
      { name: 'React Router', icon: SiReactrouter,  color: '#CA4245' },
      { name: 'Framer Motion',icon: SiFramer,       color: '#0055FF' },
    ],
    description:
      'FlavorFind ist eine cineastische Rezept-PWA zum Entdecken, Suchen und Kochen ' +
      'von Rezepten. Die App bietet Favoriten, Wochenplan, Kühlschrank-Modus und ' +
      'funktioniert auch offline als installierbare Web-App.',
    primaryColor: '#D4A574',
    liveUrl:      'https://flavorfind.yellowdeveloper.de',
    githubUrl:    'https://github.com/YoussefDawod/FlavorFind',
  },
];

