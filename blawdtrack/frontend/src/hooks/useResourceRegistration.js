import { useRef, useState } from 'react';

/**
 * Generic "submit a registration form" state machine: tracks the in-flight
 * request, the success/error feedback and the per-field errors a form needs
 * to render. Shared by every resource-registration hook (couriers, admins,
 * ...) so each one only supplies its own API call and error normalizer
 * instead of re-implementing this bookkeeping.
 *
 * @param {(payload: object) => Promise<unknown>} registerFn - calls the API.
 * @param {(error: unknown) => { fieldErrors: object, globalMessage: string|null, severity: string }} normalizeError
 * @param {(response: unknown, payload: object) => unknown} [onSuccess] - derives
 *   the value exposed as `successData` from the API response (defaults to the
 *   raw response).
 */
export function useResourceRegistration(registerFn, normalizeError, onSuccess = (response) => response) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null);
  const [severity, setSeverity] = useState('error');

  // A ref blocks a second submit fired before the state update is rendered.
  const inFlightRef = useRef(false);

  const clearFeedback = () => {
    setIsSuccess(false);
    setSuccessData(null);
    setFieldErrors({});
    setGlobalMessage(null);
  };

  const register = async (payload) => {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      const response = await registerFn(payload);
      setSuccessData(onSuccess(response, payload));
      setIsSuccess(true);
      return { ok: true };
    } catch (error) {
      const normalized = normalizeError(error);
      setFieldErrors(normalized.fieldErrors);
      setGlobalMessage(normalized.globalMessage);
      setSeverity(normalized.severity);
      return { ok: false, fieldErrors: normalized.fieldErrors };
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const setValidationErrors = (errors) => {
    setIsSuccess(false);
    setGlobalMessage(null);
    setFieldErrors(errors);
  };

  const setFieldError = (name, message) => {
    setFieldErrors((previous) => ({ ...previous, [name]: message }));
  };

  const clearFieldError = (name) => {
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  return {
    isSubmitting,
    isSuccess,
    successData,
    fieldErrors,
    globalMessage,
    severity,
    register,
    setValidationErrors,
    setFieldError,
    clearFieldError,
  };
}

export default useResourceRegistration;
