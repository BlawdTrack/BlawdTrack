// Estados de un paquete tal como los devuelve el backend (`PackageStatus`):
// PENDING, ASSIGNED, SHIPPED, IN_TRANSIT, DELIVERED, NOT_DELIVERED.
// Cada uno se muestra con una etiqueta en español y los tonos de estado del
// tema (`success`, `warning`, `error`, `info`), para que la píldora del
// encabezado verde sea legible y distinguible sin colores inventados.
const STATUS_META = {
  PENDING: { label: 'Pendiente', bgcolor: 'neutral.surface', color: 'text.secondary' },
  ASSIGNED: { label: 'Asignado', bgcolor: 'info.light', color: 'info.text' },
  SHIPPED: { label: 'Enviado', bgcolor: 'warning.light', color: 'warning.text' },
  IN_TRANSIT: { label: 'En tránsito', bgcolor: 'warning.light', color: 'warning.text' },
  DELIVERED: { label: 'Entregado', bgcolor: 'success.light', color: 'success.text' },
  NOT_DELIVERED: { label: 'No entregado', bgcolor: 'error.light', color: 'error.text' },
};

const UNKNOWN_META = { label: 'Estado desconocido', bgcolor: 'neutral.surface', color: 'text.secondary' };

/**
 * Metadatos visuales para el estado de un paquete.
 * @param {string} status Valor devuelto por el backend.
 * @returns {{ label: string, bgcolor: string, color: string, known: boolean }}
 */
export function getPackageStatusMeta(status) {
  const meta = STATUS_META[status];
  if (!meta) return { ...UNKNOWN_META, known: false };
  return { ...meta, known: true };
}

export default getPackageStatusMeta;
