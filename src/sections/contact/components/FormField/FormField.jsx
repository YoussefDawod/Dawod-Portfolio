import { useId } from 'react';
import './formField.css';

/**
 * Wiederverwendbares Form-Feld mit Floating-Label und Felder-Akzentfarbe.
 * Akzentfarbe wird via CSS-Variable `--field-accent` (Inline-Style) injiziert,
 * damit jedes Feld eigene Focus-/Underline-Farbe bekommen kann.
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
}) {
  const errorId = useId();
  const isTextarea = type === 'textarea';
  const hasError = Boolean(error);

  const commonProps = {
    id,
    name: id,
    value,
    onChange: (e) => onChange(e.target.value),
    onBlur,
    required,
    disabled,
    autoComplete,
    placeholder: ' ', // notwendig für :placeholder-shown Logik
    'aria-required': required,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
    className: 'form-field__control',
  };

  return (
    <div
      className={`form-field${hasError ? ' form-field--error' : ''}`}
      style={{ '--field-accent': accent }}
    >
      {isTextarea ? (
        <textarea rows={rows} {...commonProps} />
      ) : (
        <input type={type} {...commonProps} />
      )}
      <label htmlFor={id} className="form-field__label">{label}</label>
      <span className="form-field__line" aria-hidden="true" />
      {hasError && (
        <span id={errorId} className="form-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
