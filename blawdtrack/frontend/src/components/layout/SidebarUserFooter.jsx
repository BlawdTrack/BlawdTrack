import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { RADIUS, FONT, rem } from '../../theme';

/**
 * Pie de la barra lateral: iniciales, nombre, correo y rol del usuario, y el botón de cerrar sesión.
 * Colapsado solo deja el avatar y un botón de cerrar sesión con icono.
 * @param {{ fullName: string, email?: string, roleLabel: string, onLogout: Function,
 *   collapsed?: boolean }} props
 */
export default function SidebarUserFooter({ fullName, email = '', roleLabel, onLogout, collapsed = false }) {
  const avatar = (
    <Box
      sx={{
        width: rem(26),
        height: rem(26),
        borderRadius: '50%',
        backgroundColor: '#FF6C0E',
        color: '#12322B',
        fontSize: FONT.xs,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: `0 0 ${rem(26)}`,
      }}
    >
      {email.charAt(0).toUpperCase()}
    </Box>
  );

  if (collapsed) {
    return (
      <Box
        sx={{
          mt: 'auto',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.25,
          borderTop: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <Tooltip title={`${fullName} · ${roleLabel}`} placement="right" arrow>
          <Box>{avatar}</Box>
        </Tooltip>
        <Tooltip title="Cerrar sesión" placement="right" arrow>
          <IconButton
            onClick={onLogout}
            aria-label="Cerrar sesión"
            sx={{
              width: 44,
              height: 44,
              color: 'rgba(255,255,255,.75)',
              border: '1px solid rgba(255,255,255,.14)',
              borderRadius: RADIUS.sm,
              '&:hover': { backgroundColor: 'rgba(255,255,255,.08)' },
              '&.Mui-focusVisible': { outline: '2px solid #FF6C0E' },
            }}
          >
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 'auto', p: '1rem 1.1154rem 1.1154rem', borderTop: '1px solid rgba(255,255,255,.08)' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: '0.6154rem 0.7308rem',
          mb: 1.25,
          borderRadius: RADIUS.sm,
          backgroundColor: 'rgba(255,255,255,.05)',
        }}
      >
        {avatar}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: 'common.white' }} noWrap>
            {fullName}
          </Typography>
          <Typography sx={{ fontSize: FONT.xs, color: 'rgba(255,255,255,.7)' }} noWrap>
            {roleLabel}
          </Typography>
        </Box>
      </Box>
      <Button
        fullWidth
        onClick={onLogout}
        startIcon={<LogoutOutlinedIcon fontSize="small" />}
        sx={{
          color: 'rgba(255,255,255,.85)',
          fontSize: FONT.sm,
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: RADIUS.sm,
          border: '1px solid rgba(255,255,255,.14)',
          minHeight: 44,
          '&:hover': { backgroundColor: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.14)' },
          '&.Mui-focusVisible': { outline: '2px solid #FF6C0E' },
        }}
      >
        Cerrar sesión
      </Button>
    </Box>
  );
}
