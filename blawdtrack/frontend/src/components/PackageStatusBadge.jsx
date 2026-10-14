import { Chip } from '@mui/material';
import { PACKAGE_STATUS_STYLES, DEFAULT_PACKAGE_STATUS_KEY } from '../config/packageStatus';
import { FONT, RADIUS } from '../theme';
import { normalizeStatusKey } from '../utils/packageFormat';

function formatUnknownStatusLabel(value) {
  const text = String(value ?? '').trim();

  if (!text) {
    return PACKAGE_STATUS_STYLES[DEFAULT_PACKAGE_STATUS_KEY].label;
  }

  const normalized = text.toLowerCase().replace(/[_-]+/g, ' ').trim();
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

/**
 * Píldora de estado para el listado de paquetes.
 * @param {{ status: string|null|undefined }} props
 */
export function PackageStatusBadge({ status }) {
  const normalizedKey = normalizeStatusKey(status);
  const statusStyle = PACKAGE_STATUS_STYLES[normalizedKey] ?? PACKAGE_STATUS_STYLES[DEFAULT_PACKAGE_STATUS_KEY];
  const label = PACKAGE_STATUS_STYLES[normalizedKey] ? statusStyle.label : formatUnknownStatusLabel(status);

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        fontSize: FONT.xs,
        fontWeight: 700,
        borderRadius: RADIUS.lg,
        bgcolor: statusStyle.bgcolor,
        color: statusStyle.color,
        '& .MuiChip-label': {
          px: 1,
        },
      }}
    />
  );
}

export default PackageStatusBadge;
