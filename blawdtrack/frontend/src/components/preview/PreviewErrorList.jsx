import { Box, Typography } from '@mui/material';
import { listInvalidRows } from '../../utils/importPreview';
import { FONT, RADIUS } from '../../theme';

// Con muchos errores la lista se corta: el resto está en la tabla, filtrando por "Con errores".
const MAX_LISTED = 5;

/**
 * Qué registro falló y por qué, bajo el aviso principal de la revisión: una línea por registro con su número de envío,
 * orden y cliente, y el motivo. No muestra nada si no hay registros con error.
 * @param {{ rows: Array<object> }} props Filas de `buildImportPreview`.
 */
export default function PreviewErrorList({ rows }) {
  const invalid = listInvalidRows(rows);
  if (!invalid.length) return null;

  const listed = invalid.slice(0, MAX_LISTED);
  const hidden = invalid.length - listed.length;

  return (
    <Box
      data-testid="import-error-list"
      sx={{ p: 2, bgcolor: 'error.light', border: '1px solid', borderColor: 'error.border', borderRadius: RADIUS.sm }}
    >
      <Typography component="h3" sx={{ fontSize: FONT.md, fontWeight: 700, color: 'error.text', mb: 0.75 }}>
        Qué corregir en el archivo
      </Typography>
      {listed.map(({ key, identity, reasons }) => (
        <Typography key={key} data-testid="import-error-item" sx={{ fontSize: FONT.md, color: 'error.text', lineHeight: 1.45, mt: 0.5 }}>
          <b>{identity}:</b> {reasons.length ? reasons.join('; ') : 'Faltan datos obligatorios.'}
        </Typography>
      ))}
      {hidden > 0 && (
        <Typography sx={{ mt: 0.75, fontSize: FONT.sm, color: 'error.text' }}>
          y {hidden} {hidden === 1 ? 'registro más' : 'registros más'}: míralos en la tabla, con el filtro «Con errores».
        </Typography>
      )}
    </Box>
  );
}
