import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import BGS from './shared/BackgroundSystem/BGS.jsx';
import AppToaster from './shared/Toaster/Toaster.jsx';
import ThemeToggle from './shared/theme/ThemeToggle.jsx';
import HintBanner from './shared/HintBanner/HintBanner.jsx';
import HomePage from './pages/HomePage.jsx';
import Impressum from './pages/Impressum.jsx';
import Datenschutz from './pages/Datenschutz.jsx';
import NotFound from './pages/NotFound.jsx';

import './styles/tokens.css';
import './styles/colors.css';
import './styles/glow.css';
import './styles/glass-card.css';
import './styles/buttons.css';
import './App.css';

/**
 * Beim Routenwechsel an den Anfang scrollen (außer auf /, dort übernimmt
 * HomePage die gespeicherte Scroll-Position).
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname !== '/') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

/** Skip-Link — erstes fokussierbares Element für Tastatur-Nutzer. */
function SkipLink() {
  return (
    <a className="skip-link" href="#main-content">
      Zum Inhalt springen
    </a>
  );
}

/** BGS nur auf der Startseite zeigen — auf Legal/404 wäre er Geräusch. */
function ConditionalBGS() {
  const { pathname } = useLocation();
  if (pathname !== '/') return null;
  return <BGS />;
}

function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <ConditionalBGS />
      <ThemeToggle />
      <HintBanner />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AppToaster />
    </BrowserRouter>
  );
}

export default App;
