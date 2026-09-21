import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Avatar, Chip, CircularProgress, Paper, Divider } from '@mui/material';
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
            schedule: '6:00 am – 2:00 pm',
            status: 'ACTIVE',
            mockInfo: { inLabor: true, packages: 3 }
          },
          {
            id: 2,
            user: { firstName: 'Kevin', lastName: 'Alpizar Rojas' },
            nationalId: '2-0781-0253',
            schedule: '2:00 pm – 10:00 pm',
            status: 'ACTIVE',
            mockInfo: { inLabor: false, packages: 0 }
          },
          {
            id: 3,
            user: { firstName: 'Daniela', lastName: 'Vargas Cruz' },
            nationalId: '1-0912-0455',
            schedule: '7:00 am – 3:00 pm',
            status: 'ACTIVE',
            mockInfo: { inLabor: false, packages: 2 }
          },
          {
            id: 4,
            user: { firstName: 'Esteban', lastName: 'Núñez Mora' },
            nationalId: '3-0448-0119',
            schedule: '10:00 am – 6:00 pm',
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
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: '900px', margin: '0 auto', p: 2 }}>
      
      {/* CONTENEDOR PRINCIPAL TIPO TABLA (Card único) */}
      <Paper 
        elevation={0} 
        sx={{ 
          border: '1px solid #E5E7EB', 
          borderRadius: '12px',
          overflow: 'hidden' // Para que los bordes redondeados contengan todo bien
        }}
      >
        {/* ENCABEZADO: Título a la izquierda, subtítulo a la derecha */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          p: 3,
          bgcolor: '#FFFFFF'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#064E3B', fontSize: '1.15rem' }}>
            Mensajeros · desactivación de acceso
          </Typography>
          <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500, mt: { xs: 1, sm: 0 } }}>
            El historial de entregas se conserva siempre
          </Typography>
        </Box>

        <Divider />

        {/* LISTA DE MENSAJEROS (Filas dentro del mismo contenedor) */}
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {messengers.map((messenger, index) => (
            <React.Fragment key={messenger.id}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  p: 3,
                  gap: 2,
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F9FAFB' } // Efecto hover sutil
                }}
              >
                {/* Info Principal */}
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

                {/* Estado de labores y Paquetes */}
                <Box sx={{ minWidth: '180px', flex: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 600, 
                      color: messenger.mockInfo?.inLabor ? '#92400E' : '#047857' // Café si está en labores, Verde si está fuera
                    }}
                  >
                    {messenger.mockInfo?.inLabor ? 'En labores' : 'Fuera de labores'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9CA3AF' }}>
                    {messenger.mockInfo?.packages > 0 
                      ? `${messenger.mockInfo.packages} paquete(s) pendiente(s)` 
                      : 'Sin envíos en proceso'}
                  </Typography>
                </Box>

                {/* Acciones y Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end', flex: 1 }}>
                  <Chip 
                    label={messenger.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} 
                    size="small"
                    sx={{ 
                      bgcolor: messenger.status === 'ACTIVE' ? '#DEF7EC' : '#F3F4F6', 
                      color: messenger.status === 'ACTIVE' ? '#047857' : '#6B7280',
                      fontWeight: 700,
                      borderRadius: '16px',
                      px: 1
                    }} 
                  />
                  <Button
                    variant="outlined"
                    disabled={messenger.status === 'INACTIVE'}
                    onClick={() => handleOpenModal(messenger)}
                    sx={{
                      minWidth: '110px',
                      color: messenger.status === 'INACTIVE' ? '#9CA3AF' : (messenger.mockInfo?.inLabor ? '#B45309' : '#B91C1C'),
                      borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : (messenger.mockInfo?.inLabor ? '#F59E0B' : '#B91C1C'),
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: messenger.status === 'INACTIVE' ? '#E5E7EB' : (messenger.mockInfo?.inLabor ? '#D97706' : '#991B1B'),
                        bgcolor: messenger.status === 'INACTIVE' ? 'transparent' : (messenger.mockInfo?.inLabor ? '#FFFBEB' : '#FEF2F2')
                      }
                    }}
                  >
                    {messenger.status === 'INACTIVE' ? 'Inactivo' : 'Desactivar'}
                  </Button>
                </Box>
              </Box>
              
              {/* Divider para todas las filas excepto la última */}
              {index < messengers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
      </Paper>

      {/* RECUADRO DE ADVERTENCIA INFERIOR */}
      <Box 
        sx={{ 
          mt: 3, 
          p: 2, 
          bgcolor: '#FFFBEB', 
          borderRadius: '12px', 
          border: '1px solid #FDE68A',
          display: 'flex',
          gap: 1.5,
          alignItems: 'flex-start'
        }}
      >
        <Box
          component="span"
          sx={{
            width: 8, height: 8, borderRadius: '50%', backgroundColor: '#D97706', mt: 0.8, flexShrink: 0
          }}
        />
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