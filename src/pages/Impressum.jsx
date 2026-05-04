import { Link } from 'react-router-dom';
import './legal.css';

export default function Impressum() {
  return (
    <main id="main-content" tabIndex={-1} className="legal-page">
      <article className="legal-page__inner">
        <span className="legal-page__eyebrow">Rechtliches</span>
        <h1>Impressum</h1>

        <section className="legal-page__section">
          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            <strong>Youssef Dawod</strong><br />
            Freiberuflicher Webentwickler<br />
            Bahnhofstr. 1<br />
            29614 Soltau<br />
            Deutschland
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:dawod@yellowdeveloper.de">dawod@yellowdeveloper.de</a>
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Umsatzsteuer</h2>
          <p>
            Gemäß § 19 UStG wird keine Umsatzsteuer erhoben (Kleinunternehmerregelung).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 MStV</h2>
          <p>
            Youssef Dawod<br />
            Bahnhofstr. 1<br />
            29614 Soltau
          </p>
        </section>

        <section className="legal-page__section">
          <h2>EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
            bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p>
            Zur Teilnahme an einem Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle bin ich nicht verpflichtet und nicht bereit.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter bin ich gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG bin ich als
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Haftung für Links</h2>
          <p>
            Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen
            Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch keine Gewähr übernehmen.
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
            verantwortlich.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>Urheberrecht</h2>
          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
            dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
            Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung
            des jeweiligen Autors bzw. Erstellers.
          </p>
        </section>

        <Link to="/" className="legal-page__back" aria-label="Zurück zur Startseite">
          ← Zurück zur Startseite
        </Link>
      </article>
    </main>
  );
}
