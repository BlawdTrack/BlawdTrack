import { useLocation, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';

// Naranja más oscuro que el de la marca: el de marca sobre blanco no llega a 4.5:1 en texto pequeño.
const ACTIVE_COLOR = '#C25100';

const isGroupActive = (group, pathname) =>
  pathname === group.path || group.items.some((item) => item.path === pathname);

/**
 * Barra de pestañas inferior para teléfonos: una pestaña por grupo de navegación, que lleva al menú
 * del módulo.
 * @param {{ groups: Array }} props Grupos de `getNavigationForRole`.
 */
export default function MobileBottomNav({ groups }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderTop: '1px solid #E4DED7',
      }}
    >
      {groups.map((group) => {
        const target = group.path;
        const active = isGroupActive(group, pathname);
        const Icon = NAV_GROUP_ICONS[group.id];
        return (
          <ButtonBase
            key={group.id}
            onClick={() => target && navigate(target)}
            disabled={!target}
            aria-current={active ? 'page' : undefined}
            sx={{
              flex: 1,
              minHeight: 56,
              pt: 1.25,
              pb: 1.5,
              flexDirection: 'column',
              textAlign: 'center',
              opacity: target ? 1 : 0.5,
              '&.Mui-focusVisible': { outline: '2px solid #FF6C0E', outlineOffset: -2 },
            }}
          >
            {Icon && (
              <Icon sx={{ fontSize: 21, mb: 0.375, color: active ? ACTIVE_COLOR : '#6B6560' }} />
            )}
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: active ? ACTIVE_COLOR : '#6B6560' }}>
              {group.shortTitle}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
