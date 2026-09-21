import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, CircularProgress, Paper, Divider, Snackbar } from '@mui/material';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';

export const MessengerFleetList = () => {
  const [messengers, setMessengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchMessengers = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        
        const response = await fetch(`${baseUrl}/api/v1/couriers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMessengers(data);
        } else {
          console.error('Error al cargar la lista desde el backend');
        }
      } catch (error) {
        console.error('Error de red al obtener mensajeros:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessengers();
  }, []);

  const getInitials = (firstName = '', lastName = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleOpenModal = (messenger) => {
    setSelectedMessenger(messenger);
    setIsModalOpen(true);
  };
  
  const handleSuccessfulDeactivation = () => {
    setMessengers(prev => prev.map(m => 
      m.id === selectedMessenger.id ? { ...m, status: 'INACTIVE' } : m
    ));
    setIsModalOpen(false);
    setSnackbarOpen(true); 
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', p: 2 }}>
      
      <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, p: 3, bgcolor: '#FFFFFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#064E3B', fontSize: '1.15rem' }}>
            Mensajeros · desactivación de acceso
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500, mt: { xs: 1, sm: 0 } }}>
            El historial de entregas se conserva siempre
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {messengers.map((messenger, index) => {
            // AJUSTA ESTAS DOS VARIABLES SEGÚN LOS NOMBRES REALES DE TU BACKEND
            const isWorking = messenger.inLabor; // o messenger.status === 'EN_RUTA', etc.
            const pending = messenger.pendingPackages || 0; 

            return (
              <React.Fragment key={messenger.id}>
                <Box 
                  sx={{ 
                    display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between', p: 3, gap: 2, bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#F9FAFB' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Avatar sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600, width: 48, height: 48 }}>
                      {getInitials(messenger.user?.firstName, messenger.user?.lastName)}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#111827' }}>
                        {messenger.user?.firstName} {messenger.user?.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        {messenger.nationalId} · {messenger.schedule}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: '180px', flex: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ fontWeight: 600, color: isWorking ? '#92400E' : '#047857' }}
                    >
                      {isWorking ? 'En labores' : 'Fuera de labores'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                      {pending > 0 ? `${pending} paquete(s) pendiente(s)` : 'Sin envíos en proceso'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', flex: 1 }}>
                    <Chip 
                      label={messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} 
                      size="small"
                      sx={{ 
                        bgcolor: messenger.status === 'ACTIVE' ? '#DEF7EC' : '#F3F4F6', 
                        color: messenger.status === 'ACTIVE' ? '#047857' : '#6B7280',
                        fontWeight: 700, borderRadius: '16px', px: 1
                      }} 
                    />
                    <Button
                      variant="outlined"
                      disabled={messenger.status === 'INACTIVE'}
                      onClick={() => handleOpenModal(messenger)}
                      sx={{
                        minWidth: '110px',
                        color: messenger.status === 'INACTIVE' ? '#9CA3AF' : (isWorking ? '#B45309' : '#B91C1C'),
                        borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : (isWorking ? '#F59E0B' : '#B91C1C'),
                        textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                        '&:hover': {
                          borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : (isWorking ? '#D97706' : '#991B1B'),
                          bgcolor: messenger.status === 'INACTIVE' ? 'transparent' : (isWorking ? '#FFFBEB' : '#FEF2F2')
                        }
                      }}
                    >
                      {messenger.status === 'INACTIVE' ? 'Inactivo' : 'Desactivar'}
                    </Button>
                  </Box>
                </Box>
                {index < messengers.length - 1 && <Divider />}
              </React.Fragment>
            );
          })}
        </Box>
      </Paper>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#FFFBEB', borderRadius: '12px', border: '1px solid #FDE68A', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706', mt: 0.8, flexShrink: 0 }} />
        <Typography variant="body2" sx={{ color: '#92400E' }}>
          Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso. Tras desactivarlo no recibe nuevas asignaciones y sus paquetes pendientes deben reasignarse manualmente.
        </Typography>
      </Box>

      <DeactivateMessengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courier={selectedMessenger}
        onDeactivateSuccess={handleSuccessfulDeactivation}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          bottom: { xs: 16, sm: 24 }, right: { xs: 'auto', sm: 24 }, left: { xs: '50%', sm: 'auto' },
          transform: { xs: 'translateX(-50%)', sm: 'none' }, width: { xs: 'calc(100% - 32px)', sm: 'auto' }
        }}
      >
        <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: '8px', border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', width: '100%', minWidth: { sm: '380px' } }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#DC2626', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
            Mensajero desactivado. Reasigna sus paquetes pendientes.
          </Typography>
        </Paper>
      </Snackbar>
    </Box>
  );
};