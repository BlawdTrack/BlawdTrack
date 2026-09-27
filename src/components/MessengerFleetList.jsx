import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { listCouriers } from '../services/CourierService';
import { getInitials } from '../utils/getInitials';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';

export const MessengerFleetList = () => {
  const { logout } = useAuth();
  const [messengers, setMessengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchMessengers = async () => {
      try {
        const data = await listCouriers();
        if (!Array.isArray(data)) {
          throw new Error('La respuesta del backend no contiene una lista de mensajeros.');
        }
        setMessengers(data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          return;
        }
        setLoadError(
          requestError.response?.data?.message ||
            requestError.message ||
            'No se pudo cargar la lista de mensajeros.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessengers();
  }, [logout]);

  const handleOpenModal = (messenger) => {
    setSelectedMessenger(messenger);
    setIsModalOpen(true);
  };

  const handleSuccessfulDeactivation = () => {
    setMessengers((previous) =>
      previous.map((messenger) =>
        messenger.id === selectedMessenger.id
          ? { ...messenger, status: 'INACTIVE' }
          : messenger
      )
    );
    setIsModalOpen(false);
    setSnackbarOpen(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: '900px', margin: '0 auto', p: { xs: 1.5, sm: 2 } }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', p: { xs: 1.5, sm: 2 } }}>
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#064E3B', fontSize: '1.15rem' }}>
            Mensajeros · desactivación de acceso
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500, mt: 1 }}>
            El historial de entregas se conserva siempre
          </Typography>
        </Box>
        <Divider />

        {messengers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No hay mensajeros disponibles para mostrar.
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {messengers.map((messenger, index) => (
              <React.Fragment key={messenger.id ?? messenger.documentNumber}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', p: { xs: 1.5, sm: 3 }, gap: { xs: 1, sm: 2 }, bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F9FAFB' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, width: 48, height: 48 }}>
                      {getInitials(messenger.fullName)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#111827' }}>{messenger.fullName}</Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {messenger.documentNumber} · {messenger.schedule}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: { sm: '180px' }, flex: 1 }}>
                    {messenger.inLabor !== undefined && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: messenger.inLabor ? '#92400E' : '#047857' }}>
                        {messenger.inLabor ? 'En labores' : 'Fuera de labores'}
                      </Typography>
                    )}
                    {messenger.pendingPackages !== undefined && (
                      <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                        {messenger.pendingPackages > 0
                          ? `${messenger.pendingPackages} paquete(s) pendiente(s)`
                          : 'Sin envíos en proceso'}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', flex: 1 }}>
                    <Chip label={messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} size="small" sx={{ bgcolor: messenger.status === 'ACTIVE' ? '#DEF7EC' : '#F3F4F6', color: messenger.status === 'ACTIVE' ? '#047857' : '#6B7280', fontWeight: 700, borderRadius: '16px', px: 1 }} />
                    <Button
                      variant="outlined"
                      disabled={messenger.status === 'INACTIVE'}
                      onClick={() => handleOpenModal(messenger)}
                      sx={{ minWidth: { sm: '110px' }, color: messenger.status === 'INACTIVE' ? '#9CA3AF' : '#B91C1C', borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : '#B91C1C', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                      {messenger.status === 'INACTIVE' ? 'Inactivo' : 'Desactivar'}
                    </Button>
                  </Box>
                </Box>
                {index < messengers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}
      </Paper>

      <Alert severity="info" sx={{ mt: { xs: 1.5, sm: 3 } }}>
        La desactivación se gestiona según la validación de pendientes definida por
        el backend.
      </Alert>

      <DeactivateMessengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courier={selectedMessenger}
        onDeactivateSuccess={handleSuccessfulDeactivation}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled">
          Mensajero desactivado correctamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};
