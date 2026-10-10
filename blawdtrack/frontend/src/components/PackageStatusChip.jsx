import { Chip } from '@mui/material';
import { RADIUS, FONT } from '../theme';

// Tono de cada resultado de la validación de un registro importado (colores de estado del theme).
const KINDS = {
  valid: { label: 'Válido', tone: 'success' },
  duplicate: { label: 'Duplicado', tone: 'warning' },
  error: { label: 'Error', tone: 'error' },
};

/**
 * Etiqueta del resultado de un registro en la previsualización de una importación. Lleva siempre el texto,
 * para que el estado no dependa solo del color.
 * @param {{ kind: 'valid'|'duplicate'|'error' }} props
 */
export default function PackageStatusChip({ kind }) {
  const { label, tone } = KINDS[kind] ?? KINDS.error;

  return (
    <Chip
      label={label}
      size="small"
      sx={{ fontSize: FONT.xs, fontWeight: 700, borderRadius: RADIUS.lg, bgcolor: `${tone}.light`, color: `${tone}.text` }}
    />
  );
}
