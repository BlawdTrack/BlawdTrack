import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Avatar, 
  Paper, 
  Grid 
} from '@mui/material';
import DeleteAdminModal from '../components/DeleteAdminModal';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Lista de usuarios simulando la base de datos (basado en el video)
  const mockUsers = [
    {
      id: '1-0456-0234',
      name: 'Carlos Andrés Mora',
      email: 'c.mora@blawdgourmet.com',
      sessionActive: true
    },
    {
      id: '2-0345-0987',
      name: 'Fernanda Vindas Rojas',
      email: 'f.vindas@blawdgourmet.com',
      sessionActive: false
    },
    {
      id: '1-0678-0456',
      name: 'Luis Diego Araya',
      email: 'l.araya@blawdgourmet.com',
      sessionActive: false
    },
    
    // =========================================================
    // INICIO: MENSAJERO DE PRUEBA (SOLICITUD)
    // Borrar este objeto cuando se conecte al backend real.
    // =========================================================
    {
      id: '9-0000-0000',
      name: 'Mensajero De Prueba',
      email: 'mensajero@flota.com',
      sessionActive: false,
      isMessenger: true // Bandera temporal para identificarlo visualmente
    }
    // =========================================================
    // FIN: MENSAJERO DE PRUEBA
    // =========================================================
  ];

  const handleOpenModal = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteConfirm = (adminId) => {
    console.log(`Ejecutando eliminación en BD para el usuario con ID: ${adminId}`);
    setIsModalOpen(false);
  };

  // Función para obtener iniciales para el Avatar
  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f3ef', minHeight: '100vh' }}>
      
      {/* Contenedor principal para simular la columna izquierda del video */}
      <Box sx={{ maxWidth: '800px' }}>
        
        {/* SECCIÓN 1: Buscador */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 1 }}>
            BUSCAR ADMINISTRADOR POR CÉDULA
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField 
              fullWidth 
              variant="outlined" 
              placeholder="1-2345-6789"
              size="small"
              sx={{ bgcolor: '#fff' }}
            />
            <Button 
              variant="contained" 
              disableElevation
              sx={{ 
                bgcolor: '#1b3e32', 
                color: '#fff', 
                fontWeight: 'bold',
                px: 4,
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': { bgcolor: '#122921' }
              }}
            >
              Buscar
            </Button>
          </Box>
        </Paper>

        {/* SECCIÓN 2: Lista de Administradores */}
        <Typography variant="h6" sx={{ color: '#212121', mb: 2, fontWeight: 'bold' }}>
          Administradores
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {mockUsers.map((user, index) => (
            <Paper 
              key={index} 
              elevation={0} 
              sx={{ 
                p: 2, 
                borderRadius: 3, 
                border: user.isMessenger ? '2px dashed #1b3e32' : '1px solid #e0e0e0', // Borde punteado para distinguir al mensajero
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 2
              }}
            >
              {/* Info del Usuario */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#e0e0e0', color: '#666', fontWeight: 'bold' }}>
                  {getInitials(user.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="#212121" lineHeight={1.2}>
                    {user.name} {user.isMessenger && "(Mensajero)"}
                  </Typography>
                  <Typography variant="body2" color="#666666">
                    {user.id} · {user.email}
                  </Typography>
                </Box>
              </Box>

              {/* Estado y Acción */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', sm: 'column' }, 
                alignItems: { xs: 'center', sm: 'flex-end' }, 
                justifyContent: 'space-between',
                width: { xs: '100%', sm: 'auto' },
                gap: 1
              }}>
                {user.sessionActive ? (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#e65100', bgcolor: '#fff3e0', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold' }}>
                      Sesión activa
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="caption" sx={{ color: '#9e9e9e', fontWeight: 'bold' }}>
                    Sin sesión
                  </Typography>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    color="error"
                    disabled={user.sessionActive} // Se deshabilita si tiene sesión activa según el video
                    onClick={() => handleOpenModal(user)}
                    sx={{ 
                      textTransform: 'none', 
                      borderRadius: 2, 
                      fontWeight: 'bold',
                      py: 0.5
                    }}
                  >
                    Eliminar
                  </Button>
                  {user.sessionActive && (
                    <Typography variant="caption" sx={{ color: '#9e9e9e', mt: 0.5 }}>
                      Requiere cierre de sesión
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

      </Box>

      {/* Renderizado del Modal */}
      <DeleteAdminModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        adminData={selectedAdmin}
      />
    </Box>
  );
};

export default AdminManagement;