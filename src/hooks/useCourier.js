import { useRef, useState } from 'react';
import { registerCourier } from '../services/CourierService';
import { normalizeCourierError } from '../utils/courierErrors';

/**
 * Manages the courier registration request and exposes its outcome already
 * normalized (see courierErrors.js), never the raw axios error.
 */
export const useCourier = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null);
  const [severity, setSeverity] = useState('error');
  // A ref blocks a second submit fired before the state update is rendered.
  const inFlightRef = useRef(false);

  const clearFeedback = () => {
    setIsSuccess(false);
    setRegisteredEmail(null);
    setFieldErrors({});
    setGlobalMessage(null);
  };

  // Returns { ok: true } or { ok: false, fieldErrors } so the caller can focus
  // the first invalid field. Returns null when a submit is already running.
  const register = async (payload) => {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      const response = await registerCourier(payload);
      setRegisteredEmail(response?.email ?? payload.email);
      setIsSuccess(true);
      return { ok: true };
    } catch (error) {
      const normalized = normalizeCourierError(error);
      setFieldErrors(normalized.fieldErrors);
      setGlobalMessage(normalized.globalMessage);
      setSeverity(normalized.severity);
      return { ok: false, fieldErrors: normalized.fieldErrors };
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Shows client-side validation errors using the same channel as the API ones.
  const setValidationErrors = (errors) => {
    setIsSuccess(false);
    setGlobalMessage(null);
    setFieldErrors(errors);
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
    registeredEmail,
    fieldErrors,
    globalMessage,
    severity,
    register,
    setValidationErrors,
    clearFieldError,
  };
};

export default useCourier;
