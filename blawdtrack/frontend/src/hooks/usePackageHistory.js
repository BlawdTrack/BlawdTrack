import { useCallback, useEffect, useState } from 'react';
import { getPackageHistory, normalizeShipmentNumber } from '../services/SearchPackageService';

/** Estados posibles de la carga del historial de un paquete. */
export const PACKAGE_HISTORY_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  EMPTY: 'empty',
  ERROR: 'error',
};

// Mensajes de la interfaz del historial, separados del marcado visual.
export const PACKAGE_HISTORY_MESSAGES = {
  empty: 'No hay historial de estados disponible para este paquete.',
  network: 'No se pudo conectar con el servidor para cargar el historial.',
  forbidden: 'No tienes permisos para ver el historial de este paquete.',
  server: 'Ocurrió un error al cargar el historial. Inténtalo de nuevo.',
  fallback: 'No se pudo cargar el historial. Inténtalo de nuevo.',
};

// Resultado ya resuelto, guardado junto al número de envío al que corresponde
// para poder descartar respuestas de un paquete que ya no se está mostrando.
const INITIAL_RESULT = {
  shipmentNumber: null,
  state: PACKAGE_HISTORY_STATE.IDLE,
  entries: [],
  message: null,
  retryable: false,
};

/** Traduce el fallo de la consulta a un mensaje y a si tiene sentido reintentar. */
function messageForError(error) {
  const status = error?.response?.status;
  if (!error?.response) return { message: PACKAGE_HISTORY_MESSAGES.network, retryable: true };
  if (status === 403) return { message: PACKAGE_HISTORY_MESSAGES.forbidden, retryable: false };
  if (status >= 500) return { message: PACKAGE_HISTORY_MESSAGES.server, retryable: true };
  return { message: PACKAGE_HISTORY_MESSAGES.fallback, retryable: true };
}

/**
 * Carga el historial de estados del paquete indicado. El número de envío sale de
 * la ficha ya resuelta por `usePackageLookup`, así que el historial siempre
 * corresponde al paquete consultado y se recarga al cambiar de uno a otro.
 *
 * El estado "cargando" se deriva de comparar el número consultado con el último
 * número resuelto: mientras no coincidan, se muestra cargando. Así, si el
 * usuario consulta otro paquete con una respuesta en vuelo, la respuesta vieja
 * se descarta (por número y por `active`) y nunca se muestran eventos del
 * paquete equivocado.
 *
 * @param {string|undefined} shipmentNumber Número de envío del paquete mostrado.
 * @returns {{ state: string, entries: Array<object>, message: string|null,
 *   retryable: boolean, loading: boolean, retry: Function }}
 */
export function usePackageHistory(shipmentNumber) {
  const normalized = normalizeShipmentNumber(shipmentNumber);
  const [result, setResult] = useState(INITIAL_RESULT);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!normalized) return undefined;

    let active = true;
    getPackageHistory(normalized)
      .then((data) => {
        if (!active) return;
        const entries = Array.isArray(data) ? data : [];
        setResult({
          shipmentNumber: normalized,
          state: entries.length > 0 ? PACKAGE_HISTORY_STATE.SUCCESS : PACKAGE_HISTORY_STATE.EMPTY,
          entries,
          message: entries.length > 0 ? null : PACKAGE_HISTORY_MESSAGES.empty,
          retryable: false,
        });
      })
      .catch((error) => {
        if (!active) return;
        setResult({
          shipmentNumber: normalized,
          state: PACKAGE_HISTORY_STATE.ERROR,
          entries: [],
          ...messageForError(error),
        });
      });

    return () => {
      active = false;
    };
  }, [normalized, nonce]);

  // Reintento: se olvida el resultado y se vuelve a disparar el efecto.
  const retry = useCallback(() => {
    setResult(INITIAL_RESULT);
    setNonce((current) => current + 1);
  }, []);

  const isCurrent = Boolean(normalized) && result.shipmentNumber === normalized;
  const state = !normalized
    ? PACKAGE_HISTORY_STATE.IDLE
    : isCurrent
      ? result.state
      : PACKAGE_HISTORY_STATE.LOADING;

  return {
    state,
    entries: isCurrent ? result.entries : [],
    message: isCurrent ? result.message : null,
    retryable: isCurrent ? result.retryable : false,
    loading: state === PACKAGE_HISTORY_STATE.LOADING,
    retry,
  };
}

export default usePackageHistory;
