import { useCallback, useEffect, useRef, useState } from 'react';
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

/**
 * Carga el historial de estados del paquete indicado. El número de envío sale de
 * la ficha ya resuelta por `usePackageLookup`, así que el historial siempre
 * corresponde al paquete consultado y se recarga al cambiar de uno a otro.
 *
 * Cada carga lleva un identificador de petición: si el usuario consulta otro
 * paquete mientras una respuesta está en vuelo, la respuesta vieja se descarta
 * para no mostrar eventos del paquete equivocado.
 *
 * @param {string|undefined} shipmentNumber Número de envío del paquete mostrado.
 * @returns {{ state: string, entries: Array<object>, message: string|null,
 *   retryable: boolean, loading: boolean, retry: Function }}
 */
export function usePackageHistory(shipmentNumber) {
  const [state, setState] = useState(PACKAGE_HISTORY_STATE.IDLE);
  const [entries, setEntries] = useState([]);
  const [message, setMessage] = useState(null);
  const [retryable, setRetryable] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(async (rawShipmentNumber) => {
    const normalized = normalizeShipmentNumber(rawShipmentNumber);
    const id = requestId.current + 1;
    requestId.current = id;

    if (!normalized) {
      setState(PACKAGE_HISTORY_STATE.IDLE);
      setEntries([]);
      setMessage(null);
      setRetryable(false);
      return;
    }

    setState(PACKAGE_HISTORY_STATE.LOADING);
    setMessage(null);
    setRetryable(false);

    try {
      const data = await getPackageHistory(normalized);
      if (id !== requestId.current) return; // respuesta obsoleta: ya hay otra consulta
      const list = Array.isArray(data) ? data : [];
      setEntries(list);
      setState(list.length > 0 ? PACKAGE_HISTORY_STATE.SUCCESS : PACKAGE_HISTORY_STATE.EMPTY);
    } catch (error) {
      if (id !== requestId.current) return;
      setEntries([]);

      const status = error?.response?.status;
      if (!error?.response) {
        setMessage(PACKAGE_HISTORY_MESSAGES.network);
        setRetryable(true);
      } else if (status === 403) {
        setMessage(PACKAGE_HISTORY_MESSAGES.forbidden);
        setRetryable(false);
      } else if (status >= 500) {
        setMessage(PACKAGE_HISTORY_MESSAGES.server);
        setRetryable(true);
      } else {
        setMessage(PACKAGE_HISTORY_MESSAGES.fallback);
        setRetryable(true);
      }
      setState(PACKAGE_HISTORY_STATE.ERROR);
    }
  }, []);

  useEffect(() => {
    load(shipmentNumber);
    // Al desmontar o cambiar de paquete se invalida cualquier respuesta en vuelo.
    return () => {
      requestId.current += 1;
    };
  }, [shipmentNumber, load]);

  const retry = useCallback(() => {
    load(shipmentNumber);
  }, [shipmentNumber, load]);

  return {
    state,
    entries,
    message,
    retryable,
    loading: state === PACKAGE_HISTORY_STATE.LOADING,
    retry,
  };
}

export default usePackageHistory;
