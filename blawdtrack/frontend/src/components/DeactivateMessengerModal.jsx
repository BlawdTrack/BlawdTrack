import React, { useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Avatar, Alert 
} from '@mui/material';
import { useDeactivateMessenger } from '../hooks/useDeactivateMessenger';

export const DeactivateMessengerModal = ({ isOpen, onClose, courier, onDeactivateSuccess }) => {
  const { deactivate, isLoading, error, clearError } = useDeactivateMessenger();

  // Limpiamos el error cada vez que se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) clearError();
  }, [isOpen]);

  if (!courier) return null;

  const handleConfirm = async () => {
    // PUNTO 1: Pasamos el nationalId en lugar del courier.id
    const result = await deactivate(courier.nationalId);
    
    if (result.success) {
      onDeactivateSuccess(); 
    }
  };

  const getInitials = (firstName = '', lastName = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '12px', padding: { xs: 1, sm: 2 } }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box 
          sx={{ 
            width: 24, height: 24, border: '2px solid #111827', borderRadius: '6px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 800, color: '#111827', fontSize: '14px'
          }}
        >
          !
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
          Desactivar mensajero
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', alignItems: 'center', gap: 2, 
            p: 2, bgcolor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', mt: 1
          }}
        >
          <Avatar sx={{ bgcolor: '#E5E7EB', color: '#374151', fontWeight: 600 }}>
            {getInitials(courier.user?.firstName, courier.user?.lastName)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#111827' }}>
              {courier.user?.firstName} {courier.user?.lastName}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280' }}>
              {courier.nationalId} · {courier.schedule}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.5 }}>
          El mensajero perderá el acceso de inmediato y no recibirá nuevas asignaciones. Su historial de entregas se conserva.
        </Typography>

        {/* PUNTO 3: Mostramos el mensaje de error del backend al usuario */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: '8px', fontWeight: 500 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={isLoading}
          sx={{ 
            color: '#374151', textTransform: 'none', fontWeight: 600, fontSize: '1rem',
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirm} 
          disabled={isLoading}
          variant="contained"
          sx={{ 
            bgcolor: '#DC2626', color: 'white', textTransform: 'none', fontWeight: 600, 
            borderRadius: '8px', px: 3, py: 1, fontSize: '1rem',
            '&:hover': { bgcolor: '#B91C1C' },
            boxShadow: 'none'
          }}
        >
          {isLoading ? 'Desactivando...' : 'Sí, desactivar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};