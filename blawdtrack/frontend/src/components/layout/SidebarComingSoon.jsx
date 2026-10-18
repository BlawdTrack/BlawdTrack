import { Box, Tooltip, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';
import { COMING_SOON_MESSAGE } from '../../config/mainMenu';
import { RADIUS, FONT } from '../../theme';

const MUTED = 'rgba(255,255,255,.45)';

/**
 * Módulo del menú lateral que todavía no existe: se ve atenuado, no lleva a ninguna pantalla y al pasar el cursor (o
 * enfocarlo con el teclado) avisa que está próximo a implementarse. Expandido es una fila con el título; colapsado,
 * solo el icono.
 * @param {{ module: { id: string, title: string }, collapsed?: boolean }} props
 */
export default function SidebarComingSoon({ module, collapsed = false }) {
  const Icon = NAV_GROUP_ICONS[module.id];

  return (
    <Tooltip title={COMING_SOON_MESSAGE} placement="right" arrow>
      <Box
        role="button"
        tabIndex={0}
        aria-disabled="true"
        aria-label={collapsed ? module.title : undefined}
        sx={{
          alignSelf: collapsed ? 'center' : 'stretch',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: collapsed ? 44 : '100%',
          minHeight: 44,
          '@media (pointer: fine)': { minHeight: collapsed ? 44 : 38 },
          px: collapsed ? 0 : 1.5,
          borderRadius: RADIUS.sm,
          color: MUTED,
          cursor: 'not-allowed',
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
        }}
      >
        {collapsed ? (
          Icon && <Icon aria-hidden sx={{ fontSize: FONT.xl }} />
        ) : (
          <Typography component="span" sx={{ fontSize: FONT.sm, fontWeight: 600 }}>
            {module.title}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
