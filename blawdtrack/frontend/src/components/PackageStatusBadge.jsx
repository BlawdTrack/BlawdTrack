import { Chip } from '@mui/material';
import { PACKAGE_STATUS_STYLES, DEFAULT_PACKAGE_STATUS_KEY } from '../config/packageStatus';
import { FONT, RADIUS } from '../theme';
import { normalizeStatusKey } from '../utils/packageFormat';

function formatUnknownStatusLabel(value) {
  const text = String(value ?? '').trim();
  if (!text) return PACKAGE_STATUS_STYLES[DEFAULT_PACKAGE_STATUS_KEY].label;

  const normalized = text.toLowerCase().replace(/[_-]+/g, ' ').trim();
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

/**
 * Etiqueta de estado de un paquete en el listado de la búsqueda. Lleva siempre el nombre del estado, para que no
 * dependa solo del color.
 * @param {{ status: string|null|undefined }} props
 */
export function PackageStatusBadge({ status }) {
  const key = normalizeStatusKey(status);
  const known = PACKAGE_STATUS_STYLES[key];
  const style = known ?? PACKAGE_STATUS_STYLES[DEFAULT_PACKAGE_STATUS_KEY];

  return (
    <Chip
      label={known ? style.label : formatUnknownStatusLabel(status)}
      size="small"
      sx={{ fontSize: FONT.xs, fontWeight: 700, borderRadius: RADIUS.lg, bgcolor: style.bgcolor, color: style.color }}
    />
  );
}

export default PackageStatusBadge;
