import { Alert, Avatar, Box, Paper, Typography } from '@mui/material';
import DocumentSearch from './DocumentSearch';
import { CARD_SX } from './formStyles';
import { getInitials } from '../utils/roleAccess';

/**
 * Panel izquierdo de "Roles y permisos": busca al usuario por documento y, si lo encuentra, muestra quién es
 * (nombre, documento, rol principal y si tiene permisos personalizados).
 * @param {{ search: object, error: string, user: object|null, roleName?: string, busy?: boolean }} props
 *   `search` es el estado de `DocumentSearch`; `busy` indica que la búsqueda está en curso.
 */
export default function UserLookupPanel({ search, error, user, roleName, busy }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, alignSelf: 'start' }}>
      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
        Usuario a configurar
      </Typography>
      <DocumentSearch search={search} variant="stacked" />
      <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
        Busca por documento (cédula, DIMEX o pasaporte), sea cual sea el rol.
      </Typography>
      {busy && <Typography role="status" sx={{ fontSize: 14, color: '#6B6560' }}>Buscando...</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {user && (
        <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: '12px', bgcolor: '#F4F1EC' }}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: '#12322B', fontWeight: 700 }}>{getInitials(user.fullName)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{user.fullName}</Typography>
            <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
              {user.documentNumber} · rol principal: {roleName ?? user.role}
              {user.customized ? ' · permisos personalizados' : ''}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
