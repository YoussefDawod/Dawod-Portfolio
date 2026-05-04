import { Link } from 'react-router-dom';
import './legal.css';

export default function Datenschutz() {
  return (
    <main id="main-content" tabIndex={-1} className="legal-page">
      <article className="legal-page__inner">
        <span className="legal-page__eyebrow">Rechtliches</span>
        <h1>Datenschutzerklärung</h1>

        <section className="legal-page__section">
          <h2>1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der DSGVO ist <strong>Youssef Dawod</strong>,
            Bahnhofstr. 1, 29614 Soltau. Die Kontaktdaten finden Sie im{' '}
            <Link to="/impressum">Impressum</Link>.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>2. Erhebung allgemeiner Informationen</h2>
          <p>
            Bei jedem Aufruf dieser Website werden automatisch Informationen erfasst, die der
            Browser an den Hosting-Anbieter übermittelt. Dies sind insbesondere: Browsertyp und
            -version, verwendetes Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners,
            Uhrzeit der Anfrage und IP-Adresse. Diese Daten lassen keine Rückschlüsse auf Ihre
            Person zu und werden ausschließlich zur ordnungsgemäßen Auslieferung der Website
            sowie zur Sicherheit verarbeitet.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>3. Kontaktformular</h2>
          <p>
            Das Kontaktformular wird über den Dienst <strong>Web3Forms</strong> abgewickelt
            (Web3Forms, betrieben in der EU). Die im Formular eingegebenen Daten (Name, E-Mail,
            Nachricht) werden ausschließlich zur Beantwortung Ihrer Anfrage verarbeitet und nicht
            ohne Ihre Einwilligung weitergegeben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO
            (vorvertragliche Maßnahmen) bzw. lit. f (berechtigtes Interesse).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>4. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden nur so lange gespeichert, wie es zur Beantwortung Ihrer
            Anfrage erforderlich ist, oder solange gesetzliche Aufbewahrungspflichten bestehen.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>5. Cookies &amp; lokaler Speicher</h2>
          <p>
            Diese Website setzt keine Tracking-Cookies. Im lokalen Speicher Ihres Browsers werden
            ausschließlich zwei Einträge gespeichert: Ihre Theme-Einstellung
            (<code>yd-theme</code>: hell / dunkel) sowie die Bestätigung des Datenschutzhinweises
            (<code>yd-notice</code>). Beide Werte verlassen Ihr Gerät nicht.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>6. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit und Widerspruch gegen die Verarbeitung Ihrer
            personenbezogenen Daten. Wenden Sie sich dazu an die im Impressum genannten Kontakte.
          </p>
          <p>
            Darüber hinaus haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu
            beschweren. Die zuständige Aufsichtsbehörde ist der Landesbeauftragte für den
            Datenschutz Niedersachsen (
            <a
              href="https://www.lfd.niedersachsen.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.lfd.niedersachsen.de
            </a>
            ).
          </p>
        </section>

        <section className="legal-page__section">
          <h2>7. Hosting</h2>
          <p>
            Diese Website wird über <strong>Render</strong> bereitgestellt (Render Inc., San
            Francisco, USA). Server-Logs werden ausschließlich zum sicheren Betrieb verarbeitet
            und nach kurzer Frist gelöscht. Weitere Informationen finden Sie in der{' '}
            <a
              href="https://render.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Datenschutzerklärung von Render
            </a>
            .
          </p>
        </section>

        <section className="legal-page__section">
          <h2>8. Externe Links</h2>
          <p>
            Diese Website enthält Links zu externen Diensten wie GitHub und LinkedIn. Wenn Sie
            diese Links aufrufen, gelten die jeweiligen Datenschutzerklärungen der Anbieter. Ich
            habe keinen Einfluss auf deren Datenverarbeitung.
          </p>
        </section>

        <section className="legal-page__section">
          <h2>9. Änderungsvorbehalt</h2>
          <p>
            Diese Datenschutzerklärung kann bei Bedarf angepasst werden, um gesetzlichen
            Anforderungen zu entsprechen oder Änderungen an dieser Website widerzuspiegeln.
            Es gilt jeweils die aktuelle Fassung.
          </p>
        </section>

        <Link to="/" className="legal-page__back" aria-label="Zurück zur Startseite">
          ← Zurück zur Startseite
        </Link>
      </article>
    </main>
  );
}
