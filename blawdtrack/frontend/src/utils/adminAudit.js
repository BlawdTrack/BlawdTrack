import { formatDateTime } from './dates';

// Códigos de acción del backend (AuditServiceImpl / AdminServiceImpl) -> cómo se muestran.
const ACTION_BADGES = {
  CREAR_ADMINISTRADOR: { label: 'Creación', tone: 'success' },
  ELIMINAR_ADMINISTRADOR: { label: 'Eliminación', tone: 'danger' },
};

/**
 * Una fila de `GET /api/v1/admins/audit-log` con la forma que dibuja `HistoryList`: una insignia con el
 * tipo de acción, la fecha, el detalle que redactó el backend y quién lo hizo (hoy siempre el Súper
 * Usuario, el único que gestiona administradores).
 * @param {{ id: number|string, action: string, details: string, timestamp: string }} entry
 */
export function formatAdminAuditEntry(entry) {
  return {
    id: entry.id,
    when: formatDateTime(entry.timestamp),
    text: entry.details,
    by: 'Súper Usuario',
    badge: ACTION_BADGES[entry.action] ?? { label: entry.action, tone: 'danger' },
  };
}
