import { Link as RouterLink, useInRouterContext, useLocation } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { getParentMenu } from '../config/navigation';
import { fontPx } from '../theme';

const SIZE = 46;

function Arrow() {
  const { pathname } = useLocation();
  const parent = getParentMenu(pathname);

  if (!parent) return null;

  const label = `Volver a ${parent.label}`;
  return (
    <Tooltip title={label}>
      <IconButton
        component={RouterLink}
        to={parent.to}
        aria-label={label}
        sx={{
          width: SIZE,
          height: SIZE,
          flex: `0 0 ${SIZE}px`,
          color: 'primary.main',
          border: '1px solid',
          borderColor: 'neutral.border',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'neutral.surface' },
        }}
      >
        <ArrowBackOutlinedIcon sx={{ fontSize: fontPx(22.5) }} />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Flecha al lado del título para volver al menú anterior: desde una función, al menú que la lista; desde un
 * submenú (mensajeros, administradores), a Gestión de usuarios. No muestra nada en el menú de un grupo, fuera de
 * los módulos ni si no hay un router (como en pruebas aisladas).
 */
export default function ParentMenuArrow() {
  return useInRouterContext() ? <Arrow /> : null;
}
