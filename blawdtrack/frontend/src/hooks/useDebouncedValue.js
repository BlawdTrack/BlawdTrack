import { useEffect, useState } from 'react';

/**
 * Retrasa el valor recibido durante `delayMs` para evitar consultas por cada pulsación.
 * @param {unknown} value
 * @param {number} delayMs
 * @returns {unknown}
 */
export function useDebouncedValue(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebouncedValue;
