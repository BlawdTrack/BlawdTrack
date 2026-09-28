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

// El backend aun no expone si un mensajero esta en labores ni sus paquetes
// pendientes (ver ProvisionalCourierWorkloadPort): se muestra el mismo texto
// fijo del mockup en vez de inventar datos reales que no existen todavia.
const DUTY_PLACEHOLDER = 'Fuera de labores';
const PENDING_PLACEHOLDER = 'Sin envíos en proceso';

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
      <Paper
        elevation={0}
        sx={{ border: '1px solid #E4DED7', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 12px 30px rgba(26,60,52,.06)' }}
      >
        <Box
          sx={{
            p: { xs: 2, sm: '18px 24px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Mensajeros · desactivación de acceso
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#9E968D' }}>
            El historial de entregas se conserva siempre
          </Typography>
        </Box>

        {messengers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No hay mensajeros disponibles para mostrar.
          </Alert>
        ) : (
          messengers.map((messenger, index) => {
            const isActive = messenger.status === 'ACTIVE';
            return (
              <React.Fragment key={messenger.id ?? messenger.documentNumber}>
                {index > 0 && <Divider sx={{ borderColor: '#EFEAE4' }} />}
                <Box
                  sx={{
                    p: { xs: 2, sm: '16px 24px' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 700, fontSize: '12.5px', flex: '0 0 38px' }}>
                    {getInitials(messenger.fullName)}
                  </Avatar>

                  <Box sx={{ flex: '1 1 190px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2421' }}>
                      {messenger.fullName}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#6B6560' }}>
                      {messenger.documentNumber} · {messenger.schedule}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: '0 1 200px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2F7D4F' }}>
                      {DUTY_PLACEHOLDER}
                    </Typography>
                    <Typography sx={{ fontSize: '11.5px', color: '#9E968D' }}>
                      {PENDING_PLACEHOLDER}
                    </Typography>
                  </Box>

                  <Chip
                    label={isActive ? 'Activo' : 'Inactivo'}
                    sx={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      borderRadius: '20px',
                      bgcolor: isActive ? '#E9F3EC' : '#F1ECE7',
                      color: isActive ? '#2F7D4F' : '#6B6560',
                    }}
                  />

                  <Button
                    variant="outlined"
                    disabled={!isActive}
                    onClick={() => handleOpenModal(messenger)}
                    sx={{
                      borderRadius: '9px',
                      px: 2,
                      py: '11px',
                      fontWeight: 600,
                      fontSize: '13px',
                      bgcolor: '#fff',
                      color: isActive ? '#C0392B' : '#7A736A',
                      borderColor: isActive ? '#C0392B' : '#E4DED7',
                      '&:hover': { bgcolor: isActive ? '#FCEDEA' : '#fff', borderColor: isActive ? '#C0392B' : '#E4DED7' },
                    }}
                  >
                    {isActive ? 'Desactivar' : 'Inactivo'}
                  </Button>
                </Box>
              </React.Fragment>
            );
          })
        )}
      </Paper>

      <Box
        sx={{
          mt: { xs: 1.5, sm: 2.5 },
          bgcolor: '#FCF3E3',
          border: '1px solid #EBC98A',
          borderRadius: '14px',
          p: '18px 20px',
          display: 'flex',
          gap: '12px',
        }}
      >
        <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', bgcolor: '#C9860F', mt: '6px', flex: '0 0 8px' }} />
        <Typography sx={{ fontSize: '13.5px', color: '#7A5A12', lineHeight: 1.55 }}>
          Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso.
          Tras desactivarlo no recibe nuevas asignaciones y sus paquetes pendientes deben
          reasignarse manualmente.
        </Typography>
      </Box>

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
