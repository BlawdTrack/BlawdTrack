import { Link as RouterLink, useInRouterContext, useLocation } from 'react-router-dom';
import { IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getBackTarget } from '../config/navigation';

function BackArrow() {
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
          width: 44,
          height: 44,
          flex: '0 0 44px',
          color: 'primary.main',
          border: '1px solid #E4DED7',
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: '#F1ECE7' },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  );
}

/**
 * Flecha de retorno de las pantallas del Súper Usuario: desde la pantalla de una función vuelve al menú
 * de su módulo, y desde el menú de un módulo vuelve al menú principal. No muestra nada en el menú
 * principal, en pantallas fuera de los módulos ni si no hay un router (como en pruebas aisladas).
 */
export default function ModuleBackButton() {
  return useInRouterContext() ? <BackArrow /> : null;
}
