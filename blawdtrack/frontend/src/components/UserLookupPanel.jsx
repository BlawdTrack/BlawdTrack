import { Alert, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
        Usuario a configurar
        <Tooltip
          arrow
          enterTouchDelay={0}
          leaveTouchDelay={8000}
          title="Busca por cédula, DIMEX o pasaporte, sea cual sea el rol del usuario."
          slotProps={{ tooltip: { sx: { fontSize: 14, lineHeight: 1.5, maxWidth: 340, p: 1.5 } } }}
        >
          <IconButton aria-label="¿Qué documentos puedo buscar?" sx={{ width: 44, height: 44, my: '-10px', color: '#6B6560' }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Typography>
      <DocumentSearch search={search} />
      {busy && <Typography role="status" sx={{ fontSize: 14, color: '#6B6560' }}>Buscando...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
    </Paper>
  );
}
