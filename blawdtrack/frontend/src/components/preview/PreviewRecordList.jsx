import { Box, Paper, Typography } from '@mui/material';
import PreviewRecordRow from './PreviewRecordRow';
import { CARD_SX } from '../formStyles';
import { FONT } from '../../theme';

/**
 * Tarjeta "Registros del archivo": un encabezado con la cantidad que se muestra y una fila por registro. Si el filtro
 * activo no deja ninguno, lo dice en vez de quedar vacía.
 * @param {{ rows: Array<object> }} props Filas ya filtradas de `buildImportPreview`.
 */
export default function PreviewRecordList({ rows }) {
  return (
    <Paper component="section" aria-labelledby="preview-records-title" elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2 }}>
        <Typography id="preview-records-title" component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
          Registros del archivo
        </Typography>
        <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
          {rows.length === 1 ? '1 registro' : `${rows.length} registros`}
        </Typography>
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ px: 3, pb: 3, fontSize: FONT.md, color: 'text.secondary' }}>No hay registros en este grupo.</Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {rows.map((row) => (
            <PreviewRecordRow key={row.key} row={row} />
          ))}
        </Box>
      )}
    </Paper>
  );
}
