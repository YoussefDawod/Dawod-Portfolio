import { useId } from 'react';
import { FaCheck } from 'react-icons/fa';
import './consentCheckbox.css';

/**
 * DSGVO-konformes Einwilligungs-Checkbox mit anpassbarem Label.
 * Das eigentliche <input> ist visuell versteckt, aber semantisch vorhanden.
 */
function ConsentCheckbox({ id, checked, onChange, label, linkText, linkHref, labelEnd, error, disabled }) {
  const errorId = useId();
  const hasError = Boolean(error);

  return (
    <div className={`consent-checkbox${hasError ? ' consent-checkbox--error' : ''}`}>
      <label className="consent-checkbox__label" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          name={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          required
          aria-required="true"
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="consent-checkbox__input"
        />
        <span className="consent-checkbox__box" aria-hidden="true">
          {checked && <FaCheck className="consent-checkbox__check" />}
        </span>
        <span className="consent-checkbox__text">
          {label}
          {linkHref && (
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="consent-checkbox__link"
              tabIndex={disabled ? -1 : undefined}
            >
              {linkText}
            </a>
          )}
          {labelEnd}
        </span>
      </label>

      {hasError && (
        <span id={errorId} className="consent-checkbox__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default ConsentCheckbox;
