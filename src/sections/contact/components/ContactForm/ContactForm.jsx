import { FaArrowRight } from 'react-icons/fa';
import FormField from '../FormField/FormField.jsx';
import ConsentCheckbox from '../ConsentCheckbox/ConsentCheckbox.jsx';
import { formFields, submitText, consentField } from '../../contactData.js';
import { useContactForm } from './useContactForm.js';
import './contactForm.css';

/**
 * ContactForm — kein Card-Wrapper. Direkt auf der Section.
 */
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

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit(e);
  };

  return (
    <form
      className="cform"
      onSubmit={handleSubmit}
      onKeyDown={onKeyDown}
      noValidate
    >
      <span className="cform__eyebrow reveal" style={{ '--reveal-delay': '640ms' }}>
        Schreib mir
      </span>

      <div className="cform__fields">
        {formFields.map((f, i) => (
          <div
            key={f.id}
            className="reveal"
            style={{ '--reveal-delay': `${720 + i * 90}ms` }}
          >
            <FormField
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
          </div>
        ))}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="cform__honeypot"
        aria-hidden="true"
      />

      <div className="cform__footer reveal" style={{ '--reveal-delay': '1100ms' }}>
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
          <p className="cform__footnote">{consentField.footnote}</p>
        )}

        <button
          type="submit"
          className="cform__submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          <span className="cform__submit-label">
            {isSubmitting ? submitText.sendingLabel : submitText.idleLabel}
          </span>
          {isSubmitting ? (
            <span className="cform__spinner" aria-hidden="true" />
          ) : (
            <FaArrowRight className="cform__submit-arrow" aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  );
}

export default ContactForm;
