import { useEffect, useRef } from 'react';

/** Intervalo por defecto con el que las listas se actualizan solas. */
export const DEFAULT_POLLING_MS = 10000;

/**
 * Conserva la referencia anterior cuando los datos nuevos son idénticos, para que React no vuelva a pintar
 * la lista (y no se note ningún parpadeo) si en el servidor no cambió nada. Úsalo dentro de `setState`.
 * @template T
 * @param {T} previous
 * @param {T} next
 * @returns {T}
 */
export const keepIfEqual = (previous, next) =>
  JSON.stringify(previous) === JSON.stringify(next) ? previous : next;

/**
 * Ejecuta `callback` cada `intervalMs` y al volver a enfocar la ventana, sin hacer nada mientras la pestaña
 * está oculta. El callback siempre es el más reciente, así que no hace falta memorizarlo.
 * @param {() => void} callback
 * @param {number} [intervalMs]
 */
export const usePolling = (callback, intervalMs = DEFAULT_POLLING_MS) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      if (!document.hidden) callbackRef.current();
    };

    const intervalId = setInterval(tick, intervalMs);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', tick);
    };
  }, [intervalMs]);
};
