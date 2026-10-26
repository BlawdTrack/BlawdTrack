import { useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import DestructiveConfirmDialog from './DestructiveConfirmDialog';
import { useDeactivateMessenger } from '../hooks/useDeactivateMessenger';
import { DEACTIVATION_CONDITION, DEACTIVATION_REASSIGN, DEACTIVATION_REACTIVATE } from '../config/deactivationRules';
import { RADIUS, FONT, rem } from '../theme';

/**
 * Diálogo de confirmación para desactivar a un mensajero (HU-005). Llama a `useDeactivateMessenger`; un
 * 409 (paquetes pendientes) se muestra como advertencia y el resto de errores como error.
 * @param {{ isOpen: boolean, onClose: Function, courier: object|null, onDeactivateSuccess: Function }} props
 */
export const DeactivateMessengerModal = ({
  isOpen,
  onClose,
  courier,
  onDeactivateSuccess,
}) => {
  const { deactivate, isLoading, error, status, clearError } =
    useDeactivateMessenger();

  useEffect(() => {
    if (!isOpen) clearError();
  }, [isOpen, clearError]);

  if (!courier) return null;

  const handleConfirm = async () => {
    const result = await deactivate(courier.id);

    if (result.success) {
      onDeactivateSuccess();
    }
  };

  const isBlockedByPendingPackages = status === 409;

  return (
    <DestructiveConfirmDialog
      open={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Desactivar mensajero"
      subject={{ name: courier.fullName, detail: `${courier.documentNumber} · ${courier.schedule}` }}
      confirmLabel="Sí, desactivar"
      loadingLabel="Desactivando..."
      isLoading={isLoading}
    >
      <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.55 }}>
        El mensajero perderá el acceso de inmediato y no recibirá nuevas
        asignaciones. Su historial de entregas se conserva. {DEACTIVATION_REACTIVATE}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1.25, p: '0.7308rem 0.8462rem', bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.border', borderRadius: RADIUS.sm }}>
        <Box sx={{ width: rem(7), height: rem(7), borderRadius: '50%', bgcolor: 'warning.main', mt: '0.3846rem', flex: `0 0 ${rem(7)}` }} />
        <Typography sx={{ fontSize: FONT.sm, color: 'warning.text', lineHeight: 1.5 }}>
          {DEACTIVATION_CONDITION} {DEACTIVATION_REASSIGN}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity={isBlockedByPendingPackages ? 'warning' : 'error'}
          sx={{ borderRadius: RADIUS.sm, fontWeight: 500 }}
        >
          {error}
        </Alert>
      )}
    </DestructiveConfirmDialog>
  );
};
