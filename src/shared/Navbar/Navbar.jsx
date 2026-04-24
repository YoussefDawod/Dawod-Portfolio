import { useState, useEffect } from 'react';
import { RiHome5Line, RiUser3Line, RiCodeBoxLine, RiMailSendLine } from 'react-icons/ri';
import './navbar.css';

const navItems = [
  { id: 'home',     icon: RiHome5Line,    label: 'Home'      },
  { id: 'about',    icon: RiUser3Line,    label: 'Über mich' },
  { id: 'projects', icon: RiCodeBoxLine,  label: 'Projekte'  },
  { id: 'contact',  icon: RiMailSendLine, label: 'Kontakt'   },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen]       = useState(false);

  /* ── Active section via scroll (viewport-midpoint) ─────────── */
  useEffect(() => {
    const onScroll = () => {
      const mid = window.scrollY + window.innerHeight / 2;
      let current = navItems[0].id;
      for (const item of navItems) {
        const el = document.getElementById(item.id);
        if (el && mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) {
          current = item.id;
          break;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── Close mobile menu on outside click ────────────────────── */
  // Menü schließt nur über YD-Button (kein Auto-Close)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="site-navbar" aria-label="Hauptnavigation">

      {/* ── Desktop: Individual Glass Icons ──────────────── */}
      <div className="nav-rail">
        <ul className="nav-list" role="list">
          {navItems.map((item) => {
            const Icon     = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li
                key={item.id}
                className={`nav-item${isActive ? ' active' : ''}`}
              >
                <button
                  onClick={() => scrollTo(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className="nav-link"
                >
                  <Icon aria-hidden="true" />
                  <span className="nav-tooltip" role="tooltip">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Mobile: YD Toggle (links) + ausfahrende Icon-Rail (rechts) ── */}
      <div className="mobile-nav">
        <button
          className={`yd-btn${isMenuOpen ? ' is-open' : ''}`}
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label={isMenuOpen ? 'Navigation schließen' : 'Navigation öffnen'}
          aria-expanded={isMenuOpen}
        >
          YD
        </button>

        <div
          className={`mobile-icons${isMenuOpen ? ' is-open' : ''}`}
          aria-hidden={!isMenuOpen}
        >
          {navItems.map((item, i) => {
            const Icon     = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`mobile-icon-btn${isActive ? ' active' : ''}`}
                style={{ '--i': i }}
                tabIndex={isMenuOpen ? 0 : -1}
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
