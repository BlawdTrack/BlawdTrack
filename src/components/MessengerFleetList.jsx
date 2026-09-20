import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, CircularProgress, Paper } from '@mui/material';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';

export const MessengerFleetList = () => {
  const [messengers, setMessengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState(null);

  // PUENTE CON EL BACKEND
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
          throw new Error('Fallo al cargar backend, usando mocks');
        }
      } catch (error) {
        console.warn(error.message);
        // MOCK DE RESPALDO (Basado exactamente en tu diseño Figma)
        setMessengers([
          {
            id: 1,
            user: { firstName: 'María José', lastName: 'Solano' },
            nationalId: '1-0345-0678',
            schedule: '6:00 am - 2:00 pm',
            status: 'ACTIVE',
            mockInfo: { inLabor: true, packages: 3 } // Datos visuales que el back aún no da
          },
          {
            id: 2,
            user: { firstName: 'Kevin', lastName: 'Alpizar Rojas' },
            nationalId: '2-0781-0253',
            schedule: '2:00 pm - 10:00 pm',
            status: 'ACTIVE',
            mockInfo: { inLabor: false, packages: 0 }
          },
          {
            id: 3,
            user: { firstName: 'Esteban', lastName: 'Núñez Mora' },
            nationalId: '3-0448-0119',
            schedule: '10:00 am - 6:00 pm',
            status: 'INACTIVE',
            mockInfo: { inLabor: false, packages: 0 }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessengers();
  }, []);

  // Función para obtener iniciales del avatar
  const getInitials = (firstName = '', lastName = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleOpenModal = (messenger) => {
    setSelectedMessenger(messenger);
    setIsModalOpen(true);
  };

  // Función que se llama cuando el modal desactiva con éxito
  const handleSuccessfulDeactivation = () => {
    // Actualizamos la lista localmente para reflejar el cambio a INACTIVO
    setMessengers(prev => prev.map(m => 
      m.id === selectedMessenger.id ? { ...m, status: 'INACTIVE' } : m
    ));
    setIsModalOpen(false);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: '800px', margin: '0 auto', p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: '#374151' }}>
        Mensajeros · desactivación de acceso
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
        El historial de entregas se conserva siempre
      </Typography>

      {/* LISTA DE MENSAJEROS */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messengers.map((messenger) => (
          <Paper 
            key={messenger.id} 
            elevation={0}
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              p: 2.5, 
              border: '1px solid #E5E7EB', 
              borderRadius: '12px',
              gap: 2
            }}
          >
            {/* Info Principal */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 600 }}>
                {getInitials(messenger.user?.firstName, messenger.user?.lastName)}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600, color: '#111827' }}>
                  {messenger.user?.firstName} {messenger.user?.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280' }}>
                  {messenger.nationalId} · {messenger.schedule}
                </Typography>
              </Box>
            </Box>

            {/* Estado de labores y Paquetes */}
            <Box sx={{ minWidth: '140px' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                {messenger.mockInfo?.inLabor ? 'En labores' : 'Fuera de labores'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6B7280' }}>
                {messenger.mockInfo?.packages > 0 
                  ? `${messenger.mockInfo.packages} paquete(s) pendiente(s)` 
                  : 'Sin envíos en proceso'}
              </Typography>
            </Box>

            {/* Acciones y Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' }, justifyContent: 'space-between' }}>
              <Chip 
                label={messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} 
                sx={{ 
                  bgcolor: messenger.status === 'ACTIVE' ? '#DEF7EC' : '#F3F4F6', 
                  color: messenger.status === 'ACTIVE' ? '#03543F' : '#6B7280',
                  fontWeight: 600,
                  borderRadius: '6px'
                }} 
              />
              <Button
                variant="outlined"
                disabled={messenger.status === 'INACTIVE'}
                onClick={() => handleOpenModal(messenger)}
                sx={{
                  color: messenger.status === 'INACTIVE' ? '#9CA3AF' : '#B91C1C',
                  borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : '#B91C1C',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': {
                    borderColor: '#991B1B',
                    bgcolor: '#FEF2F2'
                  }
                }}
              >
                Desactivar
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Recuadro de advertencia inferior */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A' }}>
        <Typography variant="body2" sx={{ color: '#92400E' }}>
          Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso. Tras desactivarlo no recibe nuevas asignaciones y sus paquetes pendientes deben reasignarse manualmente.
        </Typography>
      </Box>

      {/* MODAL DESACOPLADO */}
      <DeactivateMessengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courier={selectedMessenger}
        onDeactivateSuccess={handleSuccessfulDeactivation}
      />
    </Box>
  );
};