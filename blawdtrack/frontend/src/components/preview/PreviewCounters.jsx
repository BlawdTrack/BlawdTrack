import { Box } from '@mui/material';
import StatCard from '../StatCard';
import { rem } from '../../theme';

/**
 * Los cuatro totales de la previsualización: registros leídos, válidos, con errores y duplicados.
 * @param {{ counts: { read: number, valid: number, invalid: number, duplicate: number } }} props
 *   `counts` de `buildImportPreview`.
 */
export default function PreviewCounters({ counts }) {
  return (
    <Box
      component="ul"
      aria-label="Totales de la previsualización"
      sx={{ display: 'grid', gap: 1.75, m: 0, p: 0, gridTemplateColumns: `repeat(auto-fit, minmax(${rem(150)}, 1fr))` }}
    >
      <StatCard value={counts.read} label="registros leídos" />
      <StatCard value={counts.valid} label="válidos" tone="success" />
      <StatCard value={counts.invalid} label="con errores" tone="error" />
      <StatCard value={counts.duplicate} label="duplicados" tone="warning" />
    </Box>
  );
}
