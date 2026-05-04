import { Link } from 'react-router-dom';
import './legal.css';

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="legal-page legal-page--404">
      <article className="legal-page__inner">
        <span className="legal-page__eyebrow">Verirrt</span>
        <span className="legal-page__code">404</span>
        <h1>Diese Seite gibt es nicht.</h1>
        <p>
          Vielleicht ein altes Lesezeichen, vielleicht ein Tippfehler.<br />
          Zurück zum Anfang — da wartet alles, was du suchst.
        </p>
        <Link to="/" className="legal-page__back">← Zur Startseite</Link>
      </article>
    </main>
  );
}
