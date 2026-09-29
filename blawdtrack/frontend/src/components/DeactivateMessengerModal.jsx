import React, { useEffect } from 'react';
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
        sx: { borderRadius: '18px', padding: { xs: 1, sm: 1.5 } },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: '#FCEDEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 34px',
          }}
        >
          <Box sx={{ width: '3px', height: '14px', bgcolor: '#C0392B', borderRadius: '2px' }} />
        </Box>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '17px', color: 'primary.main' }}>
          Desactivar mensajero
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            p: '14px 16px',
            bgcolor: '#F1ECE7',
            borderRadius: '12px',
          }}
        >
          <Avatar sx={{ width: 38, height: 38, bgcolor: '#9E968D', color: '#fff', fontWeight: 700, fontSize: '12.5px', flex: '0 0 38px' }}>
            {getInitials(courier.fullName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2421' }}>
              {courier.fullName}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#6B6560' }}>
              {courier.documentNumber} · {courier.schedule}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '13.5px', color: '#6B6560', lineHeight: 1.55 }}>
          El mensajero perderá el acceso de inmediato y no recibirá nuevas
          asignaciones. Su historial de entregas se conserva.
        </Typography>

        {error && (
          <Alert
            severity={isBlockedByPendingPackages ? 'warning' : 'error'}
            sx={{ borderRadius: '10px', fontWeight: 500 }}
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
            border: '1.5px solid #DCD4CA',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '14px',
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
            bgcolor: '#C0392B',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 2.5,
            fontSize: '14px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#A5301F', boxShadow: 'none' },
          }}
        >
          {isLoading ? 'Desactivando...' : 'Sí, desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
