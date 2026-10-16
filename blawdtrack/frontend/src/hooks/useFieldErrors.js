import { useState } from 'react';

/**
 * Per-field error bookkeeping shared by the form hooks (couriers, admins, ...): the error of each input plus
 * the helpers to replace them all, set one or clear one without re-rendering when it was not set.
 * @returns {{ fieldErrors: Object<string, string>, setFieldErrors: Function, setFieldError: Function,
 *   clearFieldError: Function }}
 */
export function useFieldErrors() {
  const [fieldErrors, setFieldErrors] = useState({});

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

  return { fieldErrors, setFieldErrors, setFieldError, clearFieldError };
}
