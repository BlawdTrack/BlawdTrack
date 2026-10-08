import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Avatar,
  Alert,
} from '@mui/material';
import { useDeactivateMessenger } from '../hooks/useDeactivateMessenger';
import { getInitials } from '../utils/getInitials';
import { DEACTIVATION_CONDITION, DEACTIVATION_REASSIGN, DEACTIVATION_REACTIVATE } from '../config/deactivationRules';
import { RADIUS, FONT } from '../theme';

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
    <Dialog
      open={isOpen}
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: RADIUS.md, padding: { xs: 1, sm: 1.5 }, maxWidth: 480 },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: 'error.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 28px',
          }}
        >
          <Box sx={{ width: '3px', height: '14px', bgcolor: 'error.main', borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main' }}>
          Desactivar mensajero
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '9.5px',
            p: '11px 13px',
            bgcolor: 'neutral.surface',
            borderRadius: RADIUS.sm,
          }}
        >
          <Avatar sx={{ width: 30, height: 30, bgcolor: 'neutral.main', color: 'common.white', fontWeight: 700, fontSize: FONT.xs, flex: '0 0 30px' }}>
            {getInitials(courier.fullName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>
              {courier.fullName}
            </Typography>
            <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
              {courier.documentNumber} · {courier.schedule}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.55 }}>
          El mensajero perderá el acceso de inmediato y no recibirá nuevas
          asignaciones. Su historial de entregas se conserva. {DEACTIVATION_REACTIVATE}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.25, p: '9.5px 11px', bgcolor: 'warning.light', border: '1px solid', borderColor: 'warning.border', borderRadius: RADIUS.sm }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'warning.main', mt: '5px', flex: '0 0 7px' }} />
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
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onClose}
          disabled={isLoading}
          sx={{
            color: 'primary.main',
            border: '1.5px solid', borderColor: 'neutral.borderStrong',
            borderRadius: RADIUS.sm,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: FONT.sm,
            px: 2.5,
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isLoading}
          variant="contained"
          sx={{
            bgcolor: 'error.main',
            color: 'common.white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: RADIUS.sm,
            px: 2.5,
            fontSize: FONT.sm,
            boxShadow: 'none',
            '&:hover': { bgcolor: 'error.dark', boxShadow: 'none' },
          }}
        >
          {isLoading ? 'Desactivando...' : 'Sí, desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
