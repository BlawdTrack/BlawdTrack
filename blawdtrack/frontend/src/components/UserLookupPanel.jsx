import { Alert, Box, Paper, Typography } from '@mui/material';
import DocumentSearch from './DocumentSearch';
import { CARD_SX } from './formStyles';

/**
 * Barra de búsqueda de "Roles y permisos": el título, los campos de documento en una fila y, debajo, un
 * mensaje de error si no se encontró al usuario.
 * @param {{ search: object, error: string, busy?: boolean }} props `search` es el estado de
 *   `DocumentSearch`; `busy` indica que la búsqueda está en curso.
 */
export default function UserLookupPanel({ search, error, busy }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
          Usuario a configurar
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
          Cédula, DIMEX o pasaporte, sea cual sea su rol.
        </Typography>
      </Box>
      <DocumentSearch search={search} />
      {busy && <Typography role="status" sx={{ fontSize: 14, color: '#6B6560' }}>Buscando...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
    </Paper>
  );
}
