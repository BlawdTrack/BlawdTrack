import { useCallback, useRef, useState } from 'react';
import { getPackageByShipmentNumber, normalizeShipmentNumber } from '../services/PackageService';

/** Estados posibles de una consulta de paquete. */
export const PACKAGE_LOOKUP_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  NOT_FOUND: 'notFound',
  ERROR: 'error',
};

// Mensajes de la interfaz, separados del marcado visual. No se usan ventanas
// emergentes: la pantalla los muestra con `StatusMessage`.
export const PACKAGE_LOOKUP_MESSAGES = {
  empty: 'Ingresa un número de envío para consultar.',
  incomplete:
    'La respuesta del servidor no contiene un paquete válido. Inténtalo de nuevo o reporta el caso.',
  network: 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
  forbidden: 'No tienes permisos para consultar este paquete.',
  server: 'Ocurrió un error en el servidor al consultar el paquete. Inténtalo de nuevo.',
  fallback: 'No se pudo completar la consulta. Inténtalo de nuevo.',
};

/**
 * Consulta de un paquete por número de envío. Encapsula el estado de la
 * petición (inactivo, cargando, éxito, no encontrado, error), evita consultas
 * duplicadas mientras una está en curso y valida la forma de la respuesta: un
 * 200 sin número de envío no se considera un resultado válido.
 *
 * @returns {{ state: string, pkg: object|null, message: string|null,
 *   fieldError: string|null, loading: boolean, lookup: (value: string) => Promise<void>,
 *   reset: Function }}
 */
export function usePackageLookup() {
  const [state, setState] = useState(PACKAGE_LOOKUP_STATE.IDLE);
  const [pkg, setPkg] = useState(null);
  const [message, setMessage] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  // Si el problema puede resolverse reintentando la misma consulta (red, 5xx),
  // la pantalla ofrece un botón "Reintentar"; un 403 o un "no encontrado" no.
  const [retryable, setRetryable] = useState(false);
  // Ref, no estado: se consulta de forma síncrona para bloquear el doble envío
  // (doble clic o Enter repetido) antes de que React vuelva a renderizar.
  const inFlight = useRef(false);

  const reset = useCallback(() => {
    setState(PACKAGE_LOOKUP_STATE.IDLE);
    setPkg(null);
    setMessage(null);
    setFieldError(null);
    setRetryable(false);
  }, []);

  const lookup = useCallback(async (rawShipmentNumber) => {
    if (inFlight.current) return;

    const shipmentNumber = normalizeShipmentNumber(rawShipmentNumber);
    if (!shipmentNumber) {
      setFieldError(PACKAGE_LOOKUP_MESSAGES.empty);
      setState(PACKAGE_LOOKUP_STATE.IDLE);
      setPkg(null);
      setMessage(null);
      setRetryable(false);
      return;
    }

    inFlight.current = true;
    setFieldError(null);
    setPkg(null);
    setMessage(null);
    setRetryable(false);
    setState(PACKAGE_LOOKUP_STATE.LOADING);

    try {
      const data = await getPackageByShipmentNumber(shipmentNumber);
      // Un 200 no basta: el detalle debe traer al menos el número de envío.
      if (!data || !data.shipmentNumber) {
        setState(PACKAGE_LOOKUP_STATE.ERROR);
        setMessage(PACKAGE_LOOKUP_MESSAGES.incomplete);
        setRetryable(true);
        return;
      }
      setPkg(data);
      setState(PACKAGE_LOOKUP_STATE.SUCCESS);
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;

      if (status === 404 || code === 'PACKAGE_NOT_FOUND') {
        setState(PACKAGE_LOOKUP_STATE.NOT_FOUND);
        setMessage(
          `No se encontró un paquete con el número de envío "${shipmentNumber}". Verifícalo e inténtalo de nuevo.`
        );
        setRetryable(false);
      } else if (!error?.response) {
        setState(PACKAGE_LOOKUP_STATE.ERROR);
        setMessage(PACKAGE_LOOKUP_MESSAGES.network);
        setRetryable(true);
      } else if (status === 403) {
        setState(PACKAGE_LOOKUP_STATE.ERROR);
        setMessage(PACKAGE_LOOKUP_MESSAGES.forbidden);
        setRetryable(false);
      } else if (status >= 500) {
        setState(PACKAGE_LOOKUP_STATE.ERROR);
        setMessage(PACKAGE_LOOKUP_MESSAGES.server);
        setRetryable(true);
      } else {
        setState(PACKAGE_LOOKUP_STATE.ERROR);
        setMessage(PACKAGE_LOOKUP_MESSAGES.fallback);
        setRetryable(true);
      }
    } finally {
      inFlight.current = false;
    }
  }, []);

  return {
    state,
    pkg,
    message,
    fieldError,
    retryable,
    loading: state === PACKAGE_LOOKUP_STATE.LOADING,
    lookup,
    reset,
  };
}

export default usePackageLookup;
