import Typewriter from "./components/Typewriter/Typewriter.jsx";
import { hero, cta } from "./homeData.js";
import "./home.css";

function Home() {
  return (
    <div className="home">
      <div className="home-dot-grid" />
      <div className="home-glow" />

      <div className="home-content">
        <span className="eyebrow">{hero.eyebrow}</span>
        <h1 className="hero-title">
          {hero.firstName}<br className="title-break" />{" "}
          <span className="hero-highlight">{hero.lastName}</span>
        </h1>
        <p className="hero-hook">
          {hero.hook}
        </p>

        <Typewriter />

        <div className="cta-row">
          <a href={cta.primary.href} className="btn primary">
            {cta.primary.label}
          </a>
          <a href={cta.secondary.href} className="btn ghost">
            {cta.secondary.label}
          </a>
        </div>
      </div>
    </div>
  );
}
export default Home;
