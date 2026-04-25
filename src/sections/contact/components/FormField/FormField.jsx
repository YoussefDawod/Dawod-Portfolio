import { useId } from 'react';
import './formField.css';

/**
 * Wiederverwendbares Form-Feld mit Floating-Label, animierter Underline,
 * Akzent-Punkt und optionalem Zeichen-Counter.
 *
 * Akzentfarbe wird via CSS-Variable `--field-accent` (Inline-Style) injiziert.
 */
function FormField({
  id,
  type = 'text',
  label,
  value,
  onChange,
  onBlur,
  rows,
  autoComplete,
  accent,
  required = true,
  error,
  disabled = false,
  maxLength,
}) {
  const errorId = useId();
  const isTextarea = type === 'textarea';
  const hasError = Boolean(error);
  const hasValue = Boolean(value && value.length > 0);
  const showCounter = isTextarea && typeof maxLength === 'number';
  const atLimit = showCounter && value.length >= maxLength;

  const commonProps = {
    id,
    name: id,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur,
    required,
    disabled,
    autoComplete,
    maxLength,
    placeholder: ' ', // notwendig für :placeholder-shown Logik
    'aria-required': required,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
    className: 'form-field__control',
  };

  const classes = [
    'form-field',
    hasError && 'form-field--error',
    hasValue && 'form-field--has-value',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ '--field-accent': accent }}>
      {isTextarea ? (
        <textarea rows={rows} {...commonProps} />
      ) : (
        <input type={type} {...commonProps} />
      )}
      <label htmlFor={id} className="form-field__label">{label}</label>
      <span className="form-field__line" aria-hidden="true" />
      <span className="form-field__dot" aria-hidden="true" />

      {showCounter && (
        <span
          className={`form-field__counter${atLimit ? ' form-field__counter--limit' : ''}`}
          aria-live="polite"
        >
          {value.length} / {maxLength}
        </span>
      )}

      {hasError && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
