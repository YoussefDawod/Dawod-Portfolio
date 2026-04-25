import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { formFields, web3forms, submitText, consentField } from '../../contactData.js';

const initialValues = Object.fromEntries(formFields.map((f) => [f.id, '']));
const initialErrors = Object.fromEntries(formFields.map((f) => [f.id, null]));

/**
 * useContactForm
 * Kapselt Form-State, Validierung und Web3Forms-Submit.
 *
 * Returns:
 *   values, errors, status ('idle' | 'submitting' | 'success' | 'error'),
 *   setField, blurField, handleSubmit, reset
 */
export function useContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(null);
  // Honeypot — Bots füllen das Feld aus, echte User nicht
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle');

  const setField = useCallback((id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
    // Fehler beim Tippen entfernen — User-friendly
    setErrors((prev) => (prev[id] ? { ...prev, [id]: null } : prev));
  }, []);

  const blurField = useCallback((id) => {
    const field = formFields.find((f) => f.id === id);
    if (!field?.validate) return;
    const err = field.validate(values[id] ?? '');
    setErrors((prev) => ({ ...prev, [id]: err }));
  }, [values]);

  const validateAll = useCallback(() => {
    const next = {};
    let firstInvalidId = null;
    for (const f of formFields) {
      const err = f.validate ? f.validate(values[f.id] ?? '') : null;
      next[f.id] = err;
      if (err && !firstInvalidId) firstInvalidId = f.id;
    }
    setErrors(next);
    return firstInvalidId;
  }, [values]);

  const handleConsentChange = useCallback((checked) => {
    setConsent(checked);
    if (checked) setConsentError(null);
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors(initialErrors);
    setConsent(false);
    setConsentError(null);
    setHoneypot('');
    setStatus('idle');
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();

      // Honeypot: still erfolgreich tun, aber nichts senden
      if (honeypot) {
        setStatus('success');
        return;
      }

      const firstInvalid = validateAll();
      const consentMissing = !consent;
      if (consentMissing) setConsentError(consentField.errorText);

      if (firstInvalid || consentMissing) {
        toast.error(submitText.validationToast);
        if (firstInvalid) document.getElementById(firstInvalid)?.focus();
        else document.getElementById(consentField.id)?.focus();
        return;
      }

      if (!web3forms.accessKey) {
        toast.error('Konfiguration fehlt: VITE_WEB3FORMS_KEY nicht gesetzt.');
        setStatus('error');
        return;
      }

      setStatus('submitting');

      const payload = {
        access_key: web3forms.accessKey,
        subject: web3forms.subject,
        from_name: web3forms.fromName,
        botcheck: '',
        ...values,
      };

      const sendPromise = fetch(web3forms.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || `HTTP ${res.status}`);
        }
        return data;
      });

      try {
        await toast.promise(sendPromise, {
          loading: submitText.sendingLabel,
          success: submitText.successToast,
          error: submitText.errorToast,
        });
        setStatus('success');
        reset();
      } catch {
        setStatus('error');
      }
    },
    [values, honeypot, validateAll, reset]
  );

  return {
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
    reset,
  };
}
