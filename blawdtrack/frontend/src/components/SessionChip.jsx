import { Chip } from '@mui/material';
import { RADIUS, FONT } from '../theme';

/**
 * Etiqueta de si una cuenta tiene la sesión abierta ("Sesión activa" en ámbar) o no ("Sin sesión").
 * @param {{ active: boolean }} props
 */
export default function SessionChip({ active }) {
  return (
    <Chip
      label={active ? 'Sesión activa' : 'Sin sesión'}
      size="small"
      sx={{
        fontSize: FONT.xs,
        fontWeight: 700,
        borderRadius: RADIUS.lg,
        bgcolor: active ? 'warning.light' : 'neutral.surface',
        color: active ? 'warning.dark' : 'text.secondary',
        transition: 'background-color .4s ease, color .4s ease',
      }}
    />
  );
}
