import { Box, Paper, Typography } from '@mui/material';
import PreviewRecordRow from './PreviewRecordRow';
import { PREVIEW_GRID_SX } from './previewGrid';
import { CARD_SX } from '../formStyles';
import { FONT, RADIUS } from '../../theme';

const COLUMNS = ['Estado', 'Envío', 'Cliente', 'Dirección', 'Teléfono', 'Horario'];

/**
 * Tabla "Registros del archivo": un encabezado de columnas que se queda fijo al desplazar, una fila por registro y, al
 * pie, cuántos se muestran de cuántos hay (se listan todos, sin paginar). Si el filtro o la búsqueda no dejan ninguno,
 * lo dice en vez de quedar vacía.
 * @param {{ rows: Array<object>, totalCount: number }} props `rows` ya filtradas de `buildImportPreview` y
 *   `totalCount` el total de registros del archivo.
 */
export default function PreviewRecordList({ rows, totalCount }) {
  return (
    <Paper component="section" aria-label="Registros del archivo" elevation={0} sx={{ ...CARD_SX, borderRadius: RADIUS.md }}>
      <Box
        aria-hidden="true"
        sx={{
          ...PREVIEW_GRID_SX,
          display: { xs: 'none', md: 'grid' },
          position: 'sticky',
          top: 0,
          zIndex: 1,
          height: 40,
          borderTopLeftRadius: RADIUS.md,
          borderTopRightRadius: RADIUS.md,
          pl: 'calc(16px + 4px)',
          bgcolor: 'neutral.surface',
          borderBottom: '1px solid',
          borderColor: 'neutral.border',
          fontSize: FONT.xs,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {COLUMNS.map((column) => <span key={column}>{column}</span>)}
      </Box>

      {rows.length === 0 ? (
        <Typography sx={{ px: 3, py: 3.5, textAlign: 'center', fontSize: FONT.md, color: 'text.secondary' }}>
          Ningún registro coincide.
        </Typography>
      ) : (
        <Box component="ul" sx={{ m: 0, p: 0 }}>
          {rows.map((row) => (
            <PreviewRecordRow key={row.key} row={row} />
          ))}
        </Box>
      )}

      <Typography aria-live="polite" sx={{ px: 2, py: 1.25, fontSize: FONT.sm, color: 'text.secondary' }}>
        Mostrando <b>{rows.length}</b> de {totalCount} {totalCount === 1 ? 'registro' : 'registros'}
      </Typography>
    </Paper>
  );
}
