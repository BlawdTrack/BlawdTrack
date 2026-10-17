import { useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { usePackageLookup, PACKAGE_LOOKUP_STATE } from '../hooks/usePackageLookup';
import { usePackageDeletion } from '../hooks/usePackageDeletion';
import { useCanDeletePackages } from '../hooks/useCanDeletePackages';
import { useToast } from '../hooks/useToast';
import { getHomeRoute } from '../utils/roleRoutes';
import { useAuth } from '../hooks/useAuth';
import AppHeaderBar from '../components/AppHeaderBar';
import PageHeaderBar from '../components/PageHeaderBar';
import PageContainer from '../components/PageContainer';
import PackageSearchCard from '../components/PackageSearchCard';
import PackageDetailCard from '../components/PackageDetailCard';
import StatusMessage from '../components/StatusMessage';
import DeletePackageButton from '../components/packages/DeletePackageButton';
import DeletePackageDialog from '../components/packages/DeletePackageDialog';
import Toast from '../components/Toast';
import {
  getBlockedPackageMessage,
  getDeletionResultMessage,
  shouldReloadAfter,
} from '../utils/packageDeletionMessages';
import { CARD_SX } from '../components/formStyles';
import { FONT, TOUCH_TARGET } from '../theme';

/**
 * Pantalla "Consultar paquete por número de envío" (HU-013). Consulta el
 * detalle real de un paquete en el backend y muestra su ficha de solo lectura.
 *
 * Accesible para el administrador de ventas y el súper usuario. La consulta va
 * por `SearchPackageService` (cliente axios compartido con el JWT de la sesión);
 * los campos que el backend no expone se marcan como no disponibles en vez de
 * rellenarse con datos de ejemplo.
 *
 * El Administrador de Ventas puede eliminar desde la ficha el paquete consultado (HU-012): el botón abre una
 * confirmación y, si el backend lo elimina, la ficha desaparece y el foco vuelve al campo de búsqueda. El resultado
 * se informa con un aviso flotante; tras un 409 o un 404 el paquete se vuelve a consultar para mostrar su estado real.
 */
export function PackageQueryPage() {
  const { user } = useAuth();
  const [shipmentNumber, setShipmentNumber] = useState('');
  const { state, pkg, message, fieldError, loading, lookup, retryable, reset } = usePackageLookup();
  const canDeletePackages = useCanDeletePackages();
  const { toast, notify, close: closeToast } = useToast();
  const searchInputRef = useRef(null);
  // La ficha eliminada se lleva el botón que abrió el diálogo: al cerrarse, el foco pasa al campo de búsqueda.
  const shouldFocusSearchRef = useRef(false);

  const showFeedback = (feedback) => {
    if (feedback) notify(feedback.message, feedback.severity);
  };

  const deletion = usePackageDeletion({
    onDeleted: () => {
      reset();
      setShipmentNumber('');
      shouldFocusSearchRef.current = true;
    },
    onResult: (result) => {
      showFeedback(getDeletionResultMessage(result));
      // Alguien más pudo cambiar el estado del paquete o eliminarlo: la nueva consulta muestra cómo quedó.
      if (shouldReloadAfter(result)) lookup(result.pkg.shipmentNumber);
    },
  });

  const handleDeleteDialogClosed = () => {
    if (shouldFocusSearchRef.current) {
      shouldFocusSearchRef.current = false;
      searchInputRef.current?.focus();
    }
  };

  const homeRoute = getHomeRoute(user?.role);

  const handleSubmit = () => {
    lookup(shipmentNumber);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppHeaderBar backTo={homeRoute} />
      <PageHeaderBar title="Consultar paquete" description="Busca un envío por su número y revisa su ficha de entrega." />

      <PageContainer component="main">
        <PackageSearchCard
          value={shipmentNumber}
          onChange={setShipmentNumber}
          onSubmit={handleSubmit}
          loading={loading}
          error={fieldError}
          inputRef={searchInputRef}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
            <StatusMessage severity="error" message={message} />
            {retryable && (
              <Button
                variant="outlined"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ minHeight: TOUCH_TARGET, px: 3 }}
              >
                Reintentar
              </Button>
            )}
          </Box>
        )}

        {state === PACKAGE_LOOKUP_STATE.IDLE && !fieldError && (
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            Ingresa un número de envío (por ejemplo, BG-2026-00123) y pulsa la lupa para ver su ficha.
          </Typography>
        )}

        {state === PACKAGE_LOOKUP_STATE.SUCCESS && pkg && (
          <PackageDetailCard
            pkg={pkg}
            // Sin permiso no se pasa nada: así la ficha no dibuja un pie vacío.
            actions={
              canDeletePackages ? (
                <DeletePackageButton
                  pkg={pkg}
                  onDelete={deletion.open}
                  onBlocked={(blockedPkg) => showFeedback(getBlockedPackageMessage(blockedPkg))}
                />
              ) : null
            }
          />
        )}
      </PageContainer>

      <DeletePackageDialog
        pkg={deletion.selected}
        isDeleting={deletion.isDeleting}
        onCancel={deletion.close}
        onConfirm={deletion.confirm}
        onClosed={handleDeleteDialogClosed}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </Box>
  );
}

export default PackageQueryPage;
