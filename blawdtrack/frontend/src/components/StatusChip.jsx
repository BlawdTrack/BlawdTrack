import { Chip } from '@mui/material';
import { RADIUS, FONT } from '../theme';

/**
 * Etiqueta "Activo" / "Inactivo" del estado de acceso de una cuenta.
 * @param {{ active: boolean }} props
 */
export default function StatusChip({ active }) {
  return (
    <Chip
      label={active ? 'Activo' : 'Inactivo'}
      size="small"
      sx={{
        fontSize: FONT.xs,
        fontWeight: 700,
        borderRadius: RADIUS.lg,
        bgcolor: active ? 'success.light' : 'neutral.surface',
        color: active ? 'success.dark' : 'text.secondary',
      }}
    />
  );
}
