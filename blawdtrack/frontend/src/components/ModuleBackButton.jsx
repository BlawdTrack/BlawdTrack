import { Link as RouterLink, useInRouterContext, useLocation } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { getBackTarget } from '../config/navigation';
import { rem } from '../theme';

function BackArrow({ size }) {
  const { pathname } = useLocation();
  const target = getBackTarget(pathname);

  if (!target) return null;

  const label = `Volver a ${target.label}`;
  return (
    <Tooltip title={label}>
      <IconButton
        component={RouterLink}
        to={target.to}
        aria-label={label}
        sx={{
          width: size,
          height: size,
          flex: `0 0 ${size}px`,
          color: 'primary.main',
          border: '1px solid', borderColor: 'neutral.border',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'neutral.surface' },
        }}
      >
        <ArrowBackOutlinedIcon sx={{ fontSize: size > 44 ? rem(22.5) : rem(19.5) }} />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Flecha de retorno de las pantallas del Súper Usuario: desde la pantalla de una función vuelve al menú
 * de su módulo, y desde el menú de un módulo vuelve al menú principal. No muestra nada en el menú
 * principal, en pantallas fuera de los módulos ni si no hay un router (como en pruebas aisladas).
 * @param {{ size?: number }} props Lado del botón en px (44 por defecto, el mínimo táctil).
 */
export default function ModuleBackButton({ size = 44 }) {
  return useInRouterContext() ? <BackArrow size={size} /> : null;
}
