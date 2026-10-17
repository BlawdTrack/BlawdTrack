import { Box, Button, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { useNavigate } from 'react-router-dom';
import { ProvisionalHomePage } from '../components/ProvisionalHomePage';
import { CARD_SX } from '../components/formStyles';
import { ROUTES } from '../config/routes';
import { FONT, TOUCH_TARGET } from '../theme';

// Inicio del ADMIN_VENTAS (T12). La pantalla real llega con HU-010 en adelante
// (gestión de paquetes); mientras tanto se conserva el panel provisional y se
// agrega el acceso a la consulta de paquetes (HU-013).
/**
 * Inicio del rol ADMIN_VENTAS; reutiliza `ProvisionalHomePage` y añade el
 * acceso a la consulta de paquetes por número de envío.
 */
export function SalesHomePage() {
  const navigate = useNavigate();

  return (
    <ProvisionalHomePage
      title="Panel de Ventas"
      description="Muy pronto podrás gestionar aquí los paquetes, las asignaciones y los reportes."
    >
      <Box component="section" sx={{ ...CARD_SX, p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <SearchOutlinedIcon sx={{ color: 'secondary.main' }} />
          <Typography component="h2" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Consultar un paquete
          </Typography>
        </Box>
        <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
          Busca un envío por su número y revisa su ficha de entrega.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.PACKAGE_QUERY)}
          startIcon={<SearchOutlinedIcon fontSize="small" />}
          sx={{ alignSelf: 'flex-start', minHeight: TOUCH_TARGET, px: 3 }}
        >
          Consultar paquete
        </Button>
      </Box>
    </ProvisionalHomePage>
  );
}

export default SalesHomePage;
