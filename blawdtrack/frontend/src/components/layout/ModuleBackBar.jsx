import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getBackTarget } from '../../config/navigation';

/**
 * Flecha de retorno sobre el contenido: desde la pantalla de una función vuelve al menú de su módulo, y
 * desde el menú de un módulo vuelve al menú principal. En el menú principal no se muestra.
 */
export default function ModuleBackBar() {
  const { pathname } = useLocation();
  const target = getBackTarget(pathname);

  if (!target) return null;

  return (
    <Box component="nav" aria-label="Volver" sx={{ px: { xs: 2, sm: 4 }, pt: { xs: 2, md: 3 } }}>
      <Button
        component={RouterLink}
        to={target.to}
        startIcon={<ArrowBackIcon />}
        sx={{
          minHeight: 44,
          px: 1.5,
          color: 'primary.main',
          fontWeight: 600,
          '&:hover': { bgcolor: '#F1ECE7' },
        }}
      >
        Volver a {target.label}
      </Button>
    </Box>
  );
}
