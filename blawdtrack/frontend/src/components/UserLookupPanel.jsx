import { Alert, Paper, Typography } from '@mui/material';
import DocumentSearch from './DocumentSearch';
import HelpTip from './HelpTip';
import { CARD_SX } from './formStyles';
import { FONT } from '../theme';

/**
 * Barra de búsqueda de "Roles y permisos": el título, los campos de documento en una fila y, debajo, un
 * mensaje de error si no se encontró al usuario.
 * @param {{ search: object, error: string, busy?: boolean }} props `search` es el estado de
 *   `DocumentSearch`; `busy` indica que la búsqueda está en curso.
 */
export default function UserLookupPanel({ search, error, busy }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5, flexShrink: 0 }}>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main', display: 'flex', alignItems: 'center' }}>
        Usuario a configurar
        <HelpTip label="¿Qué documentos puedo buscar?">
          Busca por cédula, DIMEX o pasaporte, sea cual sea el rol del usuario.
        </HelpTip>
      </Typography>
      <DocumentSearch search={search} />
      {busy && <Typography role="status" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>Buscando...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
    </Paper>
  );
}
