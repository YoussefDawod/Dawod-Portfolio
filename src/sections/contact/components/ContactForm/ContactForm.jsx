import { FaPaperPlane } from 'react-icons/fa';
import FormField from '../FormField/FormField.jsx';
import { formFields, submitText } from '../../contactData.js';
import { useContactForm } from './useContactForm.js';
import './contactForm.css';

function ContactForm() {
  const {
    values,
    errors,
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
        {formFields.map((f) => (
          <FormField
            key={f.id}
            id={f.id}
            type={f.type}
            label={f.label}
            rows={f.rows}
            autoComplete={f.autoComplete}
            accent={f.accent}
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
            <FaPaperPlane className="contact-form__submit-icon" aria-hidden="true" />
          )}
        </button>
      </form>
    </article>
  );
}

export default ContactForm;
