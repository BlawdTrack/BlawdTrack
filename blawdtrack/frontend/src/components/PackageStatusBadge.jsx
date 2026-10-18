import { Chip } from '@mui/material';
import { getPackageStatusMeta } from '../config/packageStatus';
import { FONT, RADIUS } from '../theme';

/**
 * Etiqueta de estado de un paquete en el listado de la búsqueda. Usa el mismo mapa de estados que la ficha, y lleva
 * siempre el nombre del estado para que no dependa solo del color.
 * @param {{ status: string|null|undefined }} props Estado tal como lo devuelve el backend (`PackageStatus`).
 */
export function PackageStatusBadge({ status }) {
  const { label, bgcolor, color } = getPackageStatusMeta(status);

  return (
    <Chip
      label={label}
      size="small"
      sx={{ fontSize: FONT.xs, fontWeight: 700, borderRadius: RADIUS.lg, bgcolor, color }}
    />
  );
}

export default PackageStatusBadge;
