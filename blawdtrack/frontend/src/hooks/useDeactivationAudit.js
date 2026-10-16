import { useCallback, useEffect, useState } from 'react';
import { getCourierDeactivations } from '../services/CourierService';
import { formatHistoryEntry } from '../utils/courierHistory';
import { keepIfEqual } from './usePolling';

// Filas de la auditoría a partir de las desactivaciones guardadas en el backend. Tienen la misma forma
// que las del historial general (mensajero, fecha, texto y autor), así se muestran con `HistoryList`.
async function fetchDeactivationAudit() {
  const entries = await getCourierDeactivations();
  return (Array.isArray(entries) ? entries : []).map((entry, index) =>
    formatHistoryEntry({ ...entry, action: 'DESACTIVAR_MENSAJERO' }, index)
  );
}

const logError = (err) => console.error('Error al cargar la auditoría de desactivaciones:', err);

/**
 * Auditoría de todas las desactivaciones (`GET /api/v1/couriers/deactivations`). Vive en la base de datos
 * y se conserva aunque el mensajero se reactive, así que se carga completa y no solo la de esta sesión.
 * @returns {{ entries: object[], reload: Function }} `reload` refresca en silencio (falla sin avisar).
 */
export function useDeactivationAudit() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let active = true;
    fetchDeactivationAudit()
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(logError);
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      const next = await fetchDeactivationAudit();
      setEntries((current) => keepIfEqual(current, next));
    } catch (err) {
      logError(err);
    }
  }, []);

  return { entries, reload };
}
