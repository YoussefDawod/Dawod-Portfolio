import { FaArrowRight } from 'react-icons/fa';
import FormField from '../FormField/FormField.jsx';
import ConsentCheckbox from '../ConsentCheckbox/ConsentCheckbox.jsx';
import { formFields, submitText, consentField } from '../../contactData.js';
import { useContactForm } from './useContactForm.js';
import './contactForm.css';

function ContactForm() {
  const {
    values,
    errors,
    consent,
    consentError,
    handleConsentChange,
    status,
    honeypot,
    setHoneypot,
    setField,
    blurField,
    handleSubmit,
  } = useContactForm();

  const isSubmitting = status === 'submitting';

  /**
   * Cmd/Ctrl + Enter aus dem Textarea sendet das Formular ab.
   */
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <article className="contact-card form-card">
      <form className="contact-form" onSubmit={handleSubmit} onKeyDown={onKeyDown} noValidate>
        <span className="contact-form__eyebrow">Schreib mir</span>

        {formFields.map((f) => (
          <FormField
            key={f.id}
            id={f.id}
            type={f.type}
            label={f.label}
            rows={f.rows}
            autoComplete={f.autoComplete}
            accent={f.accent}
            maxLength={f.maxLength}
            value={values[f.id]}
            onChange={(v) => setField(f.id, v)}
            onBlur={() => blurField(f.id)}
            error={errors[f.id]}
            disabled={isSubmitting}
          />
        ))}

        {/* Honeypot — visuell versteckt, für Bots sichtbar im DOM */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="contact-form__honeypot"
          aria-hidden="true"
        />

        <div className="contact-form__footer">
          <ConsentCheckbox
            id={consentField.id}
            checked={consent}
            onChange={handleConsentChange}
            label={consentField.label}
            linkText={consentField.linkText}
            linkHref={consentField.linkHref}
            labelEnd={consentField.labelEnd}
            error={consentError}
            disabled={isSubmitting}
          />

          {consentField.footnote && (
            <p className="contact-form__footnote">{consentField.footnote}</p>
          )}

          <button
            type="submit"
            className="contact-form__submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span>{isSubmitting ? submitText.sendingLabel : submitText.idleLabel}</span>
            {isSubmitting ? (
              <span className="contact-form__spinner" aria-hidden="true" />
            ) : (
              <FaArrowRight className="contact-form__submit-icon" aria-hidden="true" />
            )}
          </button>
        </div>
      </form>
    </article>
  );
}

export default ContactForm;
