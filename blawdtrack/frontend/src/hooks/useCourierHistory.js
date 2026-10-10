import { useCallback, useState } from 'react';
import { getCourierHistory, getCourierGeneralHistory } from '../services/CourierService';
import { formatHistoryEntry } from '../utils/courierHistory';

/**
 * Historial de modificaciones de UN mensajero (`GET /api/v1/couriers/{id}/history`), ya formateado para
 * mostrarse. Si la carga falla queda vacío en lugar de bloquear la pantalla.
 * @returns {{ entries: object[], load: (courierId: number|string) => Promise<void>, clear: Function }}
 */
export function useCourierHistory() {
  const [entries, setEntries] = useState([]);

  const load = useCallback(async (courierId) => {
    try {
      const data = await getCourierHistory(courierId);
      setEntries(Array.isArray(data) ? data.map(formatHistoryEntry) : []);
    } catch (err) {
      console.error('Error al cargar el historial del mensajero:', err);
      setEntries([]);
    }
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, load, clear };
}

/**
 * Historial GENERAL de todos los mensajeros (`GET /api/v1/couriers/history`). A diferencia del anterior,
 * sí informa del estado de la carga para poder mostrar "cargando" y "reintentar".
 * @returns {{ entries: object[], status: 'idle'|'loading'|'error', load: Function }}
 */
export function useCourierGeneralHistory() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getCourierGeneralHistory();
      setEntries(Array.isArray(data) ? data.map(formatHistoryEntry) : []);
      setStatus('idle');
    } catch (err) {
      console.error('Error al cargar el historial general de mensajeros:', err);
      setEntries([]);
      setStatus('error');
    }
  }, []);

  return { entries, status, load };
}
