import { Typography, Alert } from '@mui/material';
import DestructiveConfirmDialog from './DestructiveConfirmDialog';
import { RADIUS, FONT } from '../theme';

/**
 * Diálogo de confirmación para eliminar un administrador (HU-008).
 * @param {{ open: boolean, onClose: Function, onConfirm: (documentType: string, documentNumber: string) => void,
 *   adminData: object|null, errorMessage?: string, isSubmitting?: boolean }} props `adminData` es el
 *   administrador seleccionado; sin él no se renderiza nada.
 */
const DeleteAdminModal = ({
  open,
  onClose,
  onConfirm,
  adminData,
  errorMessage,
  isSubmitting = false,
}) => {
  if (!adminData) return null;

  const documentNumber = adminData.documentNumber
    || adminData.identification
    || adminData.nationalId
    || adminData.id;

  return (
    <DestructiveConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={() => onConfirm(adminData.documentType, documentNumber)}
      title="Eliminar administrador"
      subject={{ name: adminData.name, detail: `${documentNumber} · ${adminData.email}` }}
      confirmLabel="Sí, eliminar"
      loadingLabel="Eliminando..."
      isLoading={isSubmitting}
    >
      <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.55 }}>
        Esta acción es permanente. La cuenta pierde todos sus accesos de inmediato y queda
        registrada en auditoría con fecha, hora y responsable.
      </Typography>

      {adminData.hasActiveSession && (
        <Alert severity="warning" sx={{ borderRadius: RADIUS.sm, fontWeight: 500 }}>
          Este administrador tiene una sesión abierta. Se cerrará automáticamente al eliminarlo.
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ borderRadius: RADIUS.sm, fontWeight: 500 }}>
          {errorMessage}
        </Alert>
      )}
    </DestructiveConfirmDialog>
  );
};

export default DeleteAdminModal;
