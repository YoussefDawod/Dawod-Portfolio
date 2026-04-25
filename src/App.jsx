import { useLayoutEffect, useEffect } from "react";
import Navbar from "./shared/Navbar/Navbar.jsx";
import Home from "./sections/home/Home.jsx";
import About from "./sections/about/About.jsx";
import Projects from "./sections/projects/Projects.jsx";
import Contact from "./sections/contact/Contact.jsx";
import BGS from "./shared/BackgroundSystem/BGS.jsx";
import AppToaster from "./shared/Toaster/Toaster.jsx";
import "./styles/colors.css";
import "./styles/glow.css";
import "./styles/glass-card.css";
import "./App.css";

function App() {
  // Scroll-Position VOR dem ersten Paint wiederherstellen
  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const saved = sessionStorage.getItem('scrollY');
    if (saved) {
      window.scrollTo({ top: parseInt(saved, 10), behavior: 'instant' });
    }
  }, []);

  // Scroll-Position bei Reload speichern
  useEffect(() => {
    const save = () => sessionStorage.setItem('scrollY', String(window.scrollY));
    window.addEventListener('beforeunload', save);
    return () => window.removeEventListener('beforeunload', save);
  }, []);

  return (
    <>
      <BGS/>
      <Navbar />
      <main>
        <section id="home" data-section="YD"><Home /></section>
        <section id="about" data-section="ABOUT"><About /></section>
        <section id="projects" data-section="PROJECTS"><Projects /></section>
        <section id="contact" data-section="CONTACT"><Contact /></section>
      </main>
      <AppToaster />
    </>
  );
}

export default App;
