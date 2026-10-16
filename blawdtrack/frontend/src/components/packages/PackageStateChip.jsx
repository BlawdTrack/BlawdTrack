import { Chip } from '@mui/material';
import { PACKAGE_STATE_COLORS, PACKAGE_STATES, getPackageStateLabel } from '../../config/packageStates';
import { RADIUS, FONT } from '../../theme';

/**
 * Etiqueta del estado de un paquete en su ciclo de vida (Pendiente … Entregado). Lleva siempre el nombre del
 * estado, para que no dependa solo del color. Un estado desconocido usa los colores de Pendiente.
 * @param {{ status: string }} props Estado del paquete (`PACKAGE_STATES`).
 */
export default function PackageStateChip({ status }) {
  const colors = PACKAGE_STATE_COLORS[status] ?? PACKAGE_STATE_COLORS[PACKAGE_STATES.PENDING];

  return (
    <Chip
      label={getPackageStateLabel(status)}
      size="small"
      sx={{ fontSize: FONT.xs, fontWeight: 700, borderRadius: RADIUS.lg, bgcolor: colors.bg, color: colors.text }}
    />
  );
}
