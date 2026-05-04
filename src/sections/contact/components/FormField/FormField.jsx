import { useId } from 'react';
import './formField.css';

/**
 * FormField — kein Card, nur Hairline + großes Type.
 * --field-accent inline injiziert.
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
    placeholder: ' ',
    'aria-required': required,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? errorId : undefined,
    className: 'field__control',
  };

  const classes = [
    'field',
    hasError && 'field--error',
    hasValue && 'field--has-value',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={{ '--field-accent': accent }}>
      {isTextarea ? <textarea rows={rows} {...commonProps} /> : <input type={type} {...commonProps} />}
      <label htmlFor={id} className="field__label">{label}</label>
      <span className="field__line" aria-hidden="true" />

      {showCounter && (
        <span
          className={`field__counter${atLimit ? ' field__counter--limit' : ''}`}
          aria-live="polite"
        >
          {value.length} / {maxLength}
        </span>
      )}

      {hasError && (
        <span id={errorId} className="field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
