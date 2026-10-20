import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EmptyState from '../components/EmptyState';
import PackageDetailCard from '../components/PackageDetailCard';
import PackageFollowUp from '../components/PackageFollowUp';
import PageContainer from '../components/PageContainer';
import PageHeaderBar from '../components/PageHeaderBar';
import StatusMessage from '../components/StatusMessage';
import Toast from '../components/Toast';
import DeletePackageButton from '../components/packages/DeletePackageButton';
import DeletePackageDialog from '../components/packages/DeletePackageDialog';
import { CARD_SX } from '../components/formStyles';
import { ROUTES } from '../config/routes';
import { usePackageDeletion } from '../hooks/usePackageDeletion';
import { PACKAGE_LOOKUP_STATE, usePackageLookup } from '../hooks/usePackageLookup';
import { useCanDeletePackages } from '../hooks/useCanDeletePackages';
import { useToast } from '../hooks/useToast';
import {
  getBlockedPackageMessage,
  getDeletionResultMessage,
  shouldReloadAfter,
} from '../utils/packageDeletionMessages';
import { FONT, TOUCH_TARGET } from '../theme';

const READ_ONLY_NOTICE = 'La ficha es de solo lectura: no se puede editar el paquete, solo eliminarlo si aún no fue despachado.';

/** Aviso mientras se consulta el paquete. */
function LoadingCard() {
  return (
    <Box role="status" aria-live="polite" sx={{ ...CARD_SX, p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={20} />
      <Typography sx={{ fontSize: FONT.md, color: 'text.secondary' }}>Consultando paquete…</Typography>
    </Box>
  );
}

/** Error de la consulta, con "Reintentar" solo cuando volver a pedirlo puede resolverlo. */
function LookupError({ message, retryable, loading, onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
      <StatusMessage severity="error" message={message} />
      {retryable && (
        <Button variant="outlined" onClick={onRetry} disabled={loading} sx={{ minHeight: TOUCH_TARGET, px: 3 }}>
          Reintentar
        </Button>
      )}
    </Box>
  );
}

/**
 * Ficha de un paquete (HU-013), a la que se llega desde una fila de la búsqueda: consulta el detalle real por el número
 * de envío de la ruta y lo muestra de solo lectura. El Administrador de Ventas puede eliminarlo desde aquí (HU-012): el
 * botón abre una confirmación y, si el backend lo elimina, la ficha da paso a un aviso con el camino de vuelta a la
 * búsqueda. El resultado se informa con un aviso flotante; tras un 409 o un 404 el paquete se vuelve a consultar para
 * mostrar su estado real. El Súper Usuario ve la ficha sin el botón. Bajo la ficha va el seguimiento del paquete: su
 * historial de estados y, si ya se entregó, el comprobante.
 */
export function PackageDetailPage() {
  const { shipmentNumber } = useParams();
  const navigate = useNavigate();
  const { state, pkg, message, loading, retryable, lookup } = usePackageLookup();
  const canDeletePackages = useCanDeletePackages();
  const { toast, notify, close: closeToast } = useToast();
  // Número del paquete eliminado desde esta pantalla; al abrir la ficha de otro paquete deja de coincidir.
  const [deletedNumber, setDeletedNumber] = useState(null);
  const deleted = deletedNumber === shipmentNumber;
  const backToSearchRef = useRef(null);
  // La ficha eliminada se lleva el botón que abrió el diálogo: al cerrarse, el foco pasa al camino de vuelta.
  const shouldFocusBackRef = useRef(false);

  useEffect(() => {
    lookup(shipmentNumber);
  }, [lookup, shipmentNumber]);

  const showFeedback = (feedback) => {
    if (feedback) notify(feedback.message, feedback.severity);
  };

  const deletion = usePackageDeletion({
    onDeleted: () => {
      setDeletedNumber(shipmentNumber);
      shouldFocusBackRef.current = true;
    },
    onResult: (result) => {
      showFeedback(getDeletionResultMessage(result));
      // Alguien más pudo cambiar el estado del paquete o eliminarlo: la nueva consulta muestra cómo quedó.
      if (shouldReloadAfter(result)) lookup(result.pkg.shipmentNumber);
    },
  });

  const handleDeleteDialogClosed = () => {
    if (shouldFocusBackRef.current) {
      shouldFocusBackRef.current = false;
      backToSearchRef.current?.focus();
    }
  };

  const backToSearch = () => navigate(ROUTES.PACKAGE_SEARCH);

  return (
    <>
      <PageHeaderBar title="Ficha del paquete" />

      <PageContainer>
        {state === PACKAGE_LOOKUP_STATE.LOADING && <LoadingCard />}

        {state === PACKAGE_LOOKUP_STATE.NOT_FOUND && <StatusMessage severity="warning" message={message} />}

        {state === PACKAGE_LOOKUP_STATE.ERROR && (
          <LookupError
            message={message}
            retryable={retryable}
            loading={loading}
            onRetry={() => lookup(shipmentNumber)}
          />
        )}

        {deleted && (
          <EmptyState
            icon={DeleteOutlineOutlinedIcon}
            title="Paquete eliminado"
            description={`El paquete ${shipmentNumber} ya no está en el sistema ni en la lista del mensajero.`}
          >
            <Button ref={backToSearchRef} variant="contained" onClick={backToSearch}>
              Volver a la búsqueda
            </Button>
          </EmptyState>
        )}

        {!deleted && state === PACKAGE_LOOKUP_STATE.SUCCESS && pkg && (
          <>
            <PackageDetailCard
              pkg={pkg}
              notice={READ_ONLY_NOTICE}
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
            <PackageFollowUp pkg={pkg} />
          </>
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
    </>
  );
}

export default PackageDetailPage;
