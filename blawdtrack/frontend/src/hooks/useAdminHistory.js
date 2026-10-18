import { useCallback, useState } from 'react';
import { getAdminAuditLog, getAdministratorHistory } from '../services/AdminService';
import { formatAdminAuditEntry } from '../utils/adminAudit';

/**
 * Historial de modificaciones de UN administrador (`GET /api/v1/admins/{tipo}/{número}/history`), ya formateado para
 * mostrarse. Si la carga falla queda vacío en lugar de bloquear la pantalla. Equivale a `useCourierHistory`.
 * @returns {{ entries: object[], load: (admin: object) => Promise<void>, clear: Function }}
 */
export function useAdminHistory() {
  const [entries, setEntries] = useState([]);

  const load = useCallback(async (admin) => {
    try {
      const data = await getAdministratorHistory(admin.documentType, admin.documentNumber);
      setEntries(Array.isArray(data) ? data.map(formatAdminAuditEntry) : []);
    } catch (err) {
      console.error('Error al cargar el historial del administrador:', err);
      setEntries([]);
    }
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, load, clear };
}

/**
 * Historial GENERAL de todos los administradores (`GET /api/v1/admins/audit-log`): altas, modificaciones, activaciones,
 * desactivaciones, cambios de contraseña y eliminaciones. Informa del estado de la carga para poder mostrar "cargando"
 * y "reintentar". Equivale a `useCourierGeneralHistory`.
 * @returns {{ entries: object[], status: 'idle'|'loading'|'error', load: Function }}
 */
export function useAdminGeneralHistory() {
  const [entries, setEntries] = useState([]);
  const [status, setStatus] = useState('idle');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await getAdminAuditLog();
      setEntries(data.map(formatAdminAuditEntry));
      setStatus('idle');
    } catch (err) {
      console.error('Error al cargar el historial general de administradores:', err);
      setEntries([]);
      setStatus('error');
    }
  }, []);

  return { entries, status, load };
}
