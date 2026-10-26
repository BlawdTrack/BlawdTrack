/**
 * Fecha y hora legibles para las listas de historial y auditoría, en la configuración de Costa Rica:
 * "07/10/2026 · 01:10 a. m.".
 * @param {string | number | Date} timestamp
 * @returns {string}
 */
export function formatDateTime(timestamp) {
  const when = new Date(timestamp);
  const date = when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}
