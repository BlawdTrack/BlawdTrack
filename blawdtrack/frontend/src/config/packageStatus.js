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
// Colores de los indicadores circulares del historial de estados (línea de
// tiempo). El verde identifica los estados de avance (pendiente, asignado,
// enviado, en tránsito) y el naranja el cierre de la entrega; `NOT_DELIVERED`
// reutiliza el rojo de error de la app para no inventar un lenguaje nuevo, y un
// estado fuera del catálogo usa el neutro. El conector de la línea va aparte,
// en `neutral.border`.
const DOT_GREEN = '#2E8055';
const DOT_ORANGE = '#FF6B00';
const DOT_ERROR = '#C0392B';
const DOT_UNKNOWN = '#6B6560';

const STATUS_META = {
  PENDING: { label: 'Pendiente', bgcolor: 'neutral.surface', color: 'text.secondary', dot: DOT_GREEN },
  ASSIGNED: { label: 'Asignado', bgcolor: 'info.light', color: 'info.text', dot: DOT_GREEN },
  SHIPPED: { label: 'Enviado', bgcolor: 'warning.light', color: 'warning.text', dot: DOT_GREEN },
  IN_TRANSIT: { label: 'En tránsito', bgcolor: 'warning.light', color: 'warning.text', dot: DOT_GREEN },
  DELIVERED: { label: 'Entregado', bgcolor: 'success.light', color: 'success.text', dot: DOT_ORANGE },
  NOT_DELIVERED: { label: 'No entregado', bgcolor: 'error.light', color: 'error.text', dot: DOT_ERROR },
};

const UNKNOWN_META = { label: 'Estado desconocido', bgcolor: 'neutral.surface', color: 'text.secondary', dot: DOT_UNKNOWN };

/**
 * Metadatos visuales para el estado de un paquete.
 * @param {string} status Valor devuelto por el backend.
 * @returns {{ label: string, bgcolor: string, color: string, dot: string, known: boolean }}
 */
export function getPackageStatusMeta(status) {
  const meta = STATUS_META[status];
  if (!meta) return { ...UNKNOWN_META, known: false };
  return { ...meta, known: true };
}

/**
 * Color del indicador circular del historial para un estado.
 * @param {string} status Valor devuelto por el backend.
 * @returns {string}
 */
export function getPackageStatusDotColor(status) {
  return getPackageStatusMeta(status).dot;
}

export default getPackageStatusMeta;
