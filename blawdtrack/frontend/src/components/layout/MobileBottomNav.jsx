import { useLocation, useNavigate } from 'react-router-dom';
import { Box, ButtonBase, Typography } from '@mui/material';
import { NAV_GROUP_ICONS } from './navIcons';
import { isGroupActive } from '../../config/navigation';
import { CARD_PATTERN_SX, FONT } from '../../theme';

// Naranja más oscuro que el de la marca: el de marca sobre blanco no llega a 4.5:1 en texto pequeño.
const ACTIVE_COLOR = '#C25100';

/**
 * Barra de pestañas inferior para teléfonos: una pestaña por grupo de navegación, que lleva al menú
 * del módulo, y una de ajustes al final si el rol la tiene.
 * @param {{ groups: Array, settings?: object|null }} props Grupos de `getNavigationForRole` y menú de `getSettingsForRole`.
 */
export default function MobileBottomNav({ groups, settings = null }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Los ajustes van como una pestaña más, al final.
  const tabs = settings ? [...groups, settings] : groups;

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'flex', md: 'none' },
        ...CARD_PATTERN_SX,
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        borderTop: '1px solid', borderColor: 'neutral.border',
      }}
    >
      {tabs.map((group) => {
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
              minHeight: 48,
              pt: 1.25,
              pb: 1.5,
              flexDirection: 'column',
              textAlign: 'center',
              opacity: target ? 1 : 0.5,
              '&.Mui-focusVisible': { outline: '2px solid #FF6C0E', outlineOffset: -2 },
            }}
          >
            {Icon && (
              <Icon sx={{ fontSize: FONT.xl, mb: 0.375, color: active ? ACTIVE_COLOR : 'text.secondary' }} />
            )}
            <Typography sx={{ fontSize: FONT.xs, fontWeight: 700, color: active ? ACTIVE_COLOR : 'text.secondary' }}>
              {group.shortTitle ?? group.title}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
