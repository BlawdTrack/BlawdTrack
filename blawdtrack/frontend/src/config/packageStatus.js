// Único mapa de estados de un paquete del frontend. Las claves son las del enum
// del backend (`PackageStatus`): PENDING, ASSIGNED, SHIPPED, IN_TRANSIT,
// DELIVERED, NOT_DELIVERED. Cada estado se muestra con una etiqueta en español y
// los tonos del tema (`success`, `warning`, `error`, `info`, `neutral`), para que
// la píldora de estado sea legible y distinguible sin colores inventados.
//
// Vive en `config/` para ser la única fuente de la traducción estado → etiqueta
// y color: la consumen la ficha de consulta y, cuando entre HU-014, su insignia
// de estado, en vez de mantener mapas paralelos (algunos con claves en inglés y
// otros en español).
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
