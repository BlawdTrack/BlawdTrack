import { useCallback, useEffect, useState } from 'react';
import { getAdminAuditLog } from '../services/AdminService';
import { formatAdminAuditEntry } from '../utils/adminAudit';

const logError = (err) => console.error('Error al cargar el historial de auditoría:', err);

/**
 * Auditoría de altas y bajas de administradores (`GET /api/v1/admins/audit-log`). Es secundaria a la
 * lista de administradores: si falla no bloquea la pantalla, solo queda vacía.
 * @returns {{ entries: object[], reload: Function }}
 */
export function useAdminAuditLog() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    let active = true;
    getAdminAuditLog()
      .then((data) => {
        if (active) setEntries(data.map(formatAdminAuditEntry));
      })
      .catch(logError);
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    try {
      setEntries((await getAdminAuditLog()).map(formatAdminAuditEntry));
    } catch (err) {
      logError(err);
    }
  }, []);

  return { entries, reload };
}
