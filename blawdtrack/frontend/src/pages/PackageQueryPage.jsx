import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePackageLookup, PACKAGE_LOOKUP_STATE } from '../hooks/usePackageLookup';
import { getHomeRoute } from '../utils/roleRoutes';
import { ROUTES } from '../config/routes';
import BrandLogo from '../components/BrandLogo';
import PageContainer from '../components/PageContainer';
import PackageSearchCard from '../components/PackageSearchCard';
import PackageDetailCard from '../components/PackageDetailCard';
import StatusMessage from '../components/StatusMessage';
import { CARD_SX } from '../components/formStyles';
import { FONT, TOUCH_TARGET } from '../theme';

/**
 * Pantalla "Consultar paquete por número de envío" (HU-013). Consulta el
 * detalle real de un paquete en el backend y muestra su ficha de solo lectura.
 *
 * Accesible para el administrador de ventas y el súper usuario. La consulta va
 * por `PackageService` (cliente axios compartido con el JWT de la sesión); los
 * campos que el backend no expone se marcan como no disponibles en vez de
 * rellenarse con datos de ejemplo.
 */
export function PackageQueryPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [shipmentNumber, setShipmentNumber] = useState('');
  const { state, pkg, message, fieldError, loading, lookup } = usePackageLookup();

  const homeRoute = getHomeRoute(user?.role);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleSubmit = () => {
    lookup(shipmentNumber);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box
        component="header"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderBottom: '4px solid',
          borderColor: 'secondary.main',
          px: { xs: 2, sm: 4 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <BrandLogo variant="horizontal" onDark width={108} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {homeRoute && (
            <Button
              onClick={() => navigate(homeRoute)}
              startIcon={<ArrowBackOutlinedIcon fontSize="small" />}
              sx={{
                color: 'rgba(255,255,255,.9)',
                minHeight: TOUCH_TARGET,
                border: '1px solid rgba(255,255,255,.25)',
                bgcolor: 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
              }}
            >
              Volver
            </Button>
          )}
          <Button
            onClick={handleLogout}
            startIcon={<LogoutOutlinedIcon fontSize="small" />}
            sx={{
              color: 'rgba(255,255,255,.9)',
              minHeight: TOUCH_TARGET,
              border: '1px solid rgba(255,255,255,.25)',
              bgcolor: 'transparent',
              '&:hover': { bgcolor: 'rgba(255,255,255,.08)' },
            }}
          >
            Cerrar sesión
          </Button>
        </Box>
      </Box>

      <PageContainer component="main">
        <Box sx={{ pl: 2, borderLeft: '4px solid', borderColor: 'secondary.main' }}>
          <Typography variant="h5" component="h1" sx={{ color: 'primary.main' }}>
            Consultar paquete
          </Typography>
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', mt: 0.5 }}>
            Busca un envío por su número y revisa su ficha de entrega.
          </Typography>
        </Box>

        <PackageSearchCard
          value={shipmentNumber}
          onChange={setShipmentNumber}
          onSubmit={handleSubmit}
          loading={loading}
          error={fieldError}
        />

        {state === PACKAGE_LOOKUP_STATE.LOADING && (
          <Box
            role="status"
            aria-live="polite"
            sx={{ ...CARD_SX, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <CircularProgress size={20} />
            <Typography sx={{ fontSize: FONT.md, color: 'text.secondary' }}>Consultando paquete…</Typography>
          </Box>
        )}

        {state === PACKAGE_LOOKUP_STATE.NOT_FOUND && (
          <StatusMessage severity="warning" message={message} />
        )}

        {state === PACKAGE_LOOKUP_STATE.ERROR && (
          <StatusMessage severity="error" message={message} />
        )}

        {state === PACKAGE_LOOKUP_STATE.IDLE && !fieldError && (
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            Ingresa un número de envío (por ejemplo, BG-2026-00123) y pulsa Consultar para ver su ficha.
          </Typography>
        )}

        {state === PACKAGE_LOOKUP_STATE.SUCCESS && pkg && <PackageDetailCard pkg={pkg} />}
      </PageContainer>
    </Box>
  );
}

export default PackageQueryPage;
