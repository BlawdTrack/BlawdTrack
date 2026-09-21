import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { useDeactivateMessenger } from '../hooks/useDeactivateMessenger';
/**
 * COMPONENTE PRESENTACIONAL (UI) - HU005
 * 
 * - Este modal está 100% desacoplado de la lógica de comunicación con el backend.
 * - Si esta vista se elimina, reemplaza o modifica (ej. por un drawer o alerta simple),
 *   la lógica de la petición NO se verá afectada.
 * - La ejecución de la petición DELETE, el manejo de estados (loading, error) y el 
 *   control del flujo son responsabilidad exclusiva del hook `useDeactivateMessenger`.
 */
const DeactivateMessengerModal = ({ open, onClose, messenger, onSuccess }) => {
  const { deactivateMessenger, loading, error } = useDeactivateMessenger();

  if (!messenger) return null;

  const handleConfirmDeactivation = async () => {
    const success = await deactivateMessenger(messenger.id);
    if (success) {
      if (onSuccess) onSuccess(messenger.id);
      onClose();
    } else if (error) {
      alert(`Error al desactivar: ${error}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '8px',
          maxWidth: '480px',
          width: '100%'
        }
      }}
    >
      <DialogContent>
        {/* Encabezado */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <WarningAmberRoundedIcon sx={{ color: '#b91c1c', fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            Desactivar mensajero
          </Typography>
        </Box>

        {/* Tarjeta de la Persona */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            backgroundColor: '#f3efe6',
            borderRadius: '12px',
            p: 2,
            mb: 2
          }}
        >
          <Avatar
            src={messenger.avatar || ''}
            sx={{ width: 48, height: 48, bgcolor: '#9ca3af' }}
          />
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>
              {messenger.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.85rem' }}>
              Cédula {messenger.identification} · {messenger.schedule}
            </Typography>
          </Box>
        </Box>

        {/* Recuadro de Advertencia de Entregas */}
        <Box
          sx={{
            backgroundColor: '#fffbeb',
            border: '1px solid #fef3c7',
            borderRadius: '12px',
            p: 2,
            mb: 3,
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start'
          }}
        >
          <Box
            component="span"
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#d97706',
              mt: 0.8,
              flexShrink: 0
            }}
          />
          <Typography variant="body2" sx={{ color: '#92400e', lineHeight: 1.4, fontSize: '0.875rem' }}>
            Este mensajero tiene {messenger.pendingDeliveries ?? 0} entregas pendientes asignadas. Desactivarlo puede afectar las rutas en curso.
          </Typography>
        </Box>

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              borderColor: '#d1d5db',
              color: '#374151',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { borderColor: '#9ca3af', backgroundColor: '#f9fafb' }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDeactivation}
            disabled={loading}
            variant="contained"
            disableElevation
            sx={{
              borderRadius: '8px',
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              '&:hover': { backgroundColor: '#991b1b' }
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Sí, desactivar'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateMessengerModal;