import { useCallback, useEffect, useState } from 'react';

/**
 * Cuenta regresiva de `seconds` segundos que se activa con `start()`. Se calcula contra la hora de término
 * (no sumando ticks), así no se atrasa si la pestaña queda en segundo plano.
 * @param {number} seconds Duración total.
 * @returns {{ remaining: number, running: boolean, start: Function }} `remaining` son los segundos que
 *   faltan (0 cuando no corre).
 */
export function useCountdown(seconds) {
  const [deadline, setDeadline] = useState(null);
  const [remaining, setRemaining] = useState(0);

  const start = useCallback(() => {
    setDeadline(Date.now() + seconds * 1000);
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (deadline === null) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setDeadline(null);
    };
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [deadline]);

  return { remaining, running: remaining > 0, start };
}
