// Estados de un paquete en la búsqueda: etiqueta y colores del tema (sin colores propios). La clave es el estado
// que guarda el backend (`PENDIENTE`); las del enum en inglés (`PENDING`...) se aceptan como alias por si el
// backend pasa a devolverlas.
export const PACKAGE_STATUS_STYLES = {
  ENTREGADO: { label: 'Entregado', bgcolor: 'success.light', color: 'success.text' },
  EN_TRANSITO: { label: 'En tránsito', bgcolor: 'warning.light', color: 'warning.text' },
  ENVIADO: { label: 'Enviado', bgcolor: 'secondary.light', color: 'secondary.text' },
  ASIGNADO: { label: 'Asignado', bgcolor: 'info.light', color: 'info.text' },
  PENDIENTE: { label: 'Pendiente', bgcolor: 'neutral.surface', color: 'text.secondary' },
  NO_ENTREGADO: { label: 'No entregado', bgcolor: 'error.light', color: 'error.text' },
};

export const DEFAULT_PACKAGE_STATUS_KEY = 'PENDIENTE';

export const PACKAGE_STATUS_ALIASES = {
  DELIVERED: 'ENTREGADO',
  IN_TRANSIT: 'EN_TRANSITO',
  SHIPPED: 'ENVIADO',
  ASSIGNED: 'ASIGNADO',
  PENDING: 'PENDIENTE',
  NOT_DELIVERED: 'NO_ENTREGADO',
};
