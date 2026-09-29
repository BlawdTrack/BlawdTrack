import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';

const firstEnabledPath = (group) => group.items.find((item) => item.path)?.path ?? null;
const isGroupActive = (group, pathname) => group.items.some((item) => item.path === pathname);

/**
 * Barra de pestañas inferior para teléfonos: una pestaña por grupo de navegación, que lleva a la
 * primera pantalla disponible del grupo.
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
        const target = firstEnabledPath(group);
        const active = isGroupActive(group, pathname);
        const Icon = NAV_GROUP_ICONS[group.id];
        return (
          <Box
            key={group.id}
            onClick={() => target && navigate(target)}
            sx={{
              flex: 1,
              pt: 1.25,
              pb: 1.5,
              textAlign: 'center',
              cursor: target ? 'pointer' : 'default',
              opacity: target ? 1 : 0.5,
            }}
          >
            {Icon && (
              <Icon sx={{ fontSize: 21, mb: 0.375, color: active ? '#FF6C0E' : '#9E968D' }} />
            )}
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: active ? '#FF6C0E' : '#9E968D' }}>
              {group.shortTitle}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
