import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  TextField, 
  Avatar, 
  Paper, 
  Divider,
  Snackbar,
  Alert,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';

// Iconos para la navegación móvil
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';

import DeleteAdminModal from '../components/DeleteAdminModal';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [navValue, setNavValue] = useState('admins');

  // Dejamos SOLO el mensajero de prueba como solicitaste
  const [mockUsers, setMockUsers] = useState([
    {
      id: '9-0000-0000',
      name: 'Mensajero De Prueba',
      email: 'mensajero@flota.com',
      sessionActive: false
    }
  ]);

  // Estado inicial de la auditoría (con un dato falso para mostrar estructura)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      date: '15/09/2026 - 10:24',
      action: 'Creación',
      details: 'Administrador Fernanda Vindas Rojas - 2-0345-0987',
      role: 'Súper Usuario',
      isCreation: true
    }
  ]);

  const handleOpenModal = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteConfirm = (adminId) => {
    const adminToDelete = mockUsers.find(u => u.id === adminId);
    
    // 1. Eliminar de la lista
    setMockUsers(mockUsers.filter(u => u.id !== adminId));

    // 2. Crear registro de auditoría con HORA Y FECHA ACTUAL
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

    const newLog = {
      id: Date.now(),
      date: `${dateStr} - ${timeStr}`,
      action: 'Eliminación',
      details: `Administrador ${adminToDelete.name} - ${adminToDelete.id}`,
      role: 'Súper Usuario',
      isCreation: false
    };

    // Agregar el log al inicio de la lista
    setAuditLogs([newLog, ...auditLogs]);

    // 3. Cerrar modal y mostrar alerta de éxito
    setIsModalOpen(false);
    setToastOpen(true);
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      bgcolor: '#f4f3ef', 
      minHeight: '100vh',
      pb: { xs: 10, md: 4 } // Padding extra en móvil para que no estorbe el BottomNav
    }}>
      
      <Box sx={{ maxWidth: '800px' }}>
        
        {/* BUSCADOR */}
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
                bgcolor: '#1b3e32', color: '#fff', fontWeight: 'bold', px: 4, textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: '#122921' }
              }}
            >
              Buscar
            </Button>
          </Box>
        </Paper>

        {/* LISTA DE ADMINISTRADORES EN UN SOLO BLOQUE */}
        <Typography variant="h6" sx={{ color: '#212121', mb: 2, fontWeight: 'bold' }}>
          Administradores
        </Typography>
        
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', mb: 4 }}>
          {mockUsers.length === 0 ? (
            <Typography variant="body1" sx={{ p: 3, color: '#666', textAlign: 'center' }}>
              No hay administradores registrados.
            </Typography>
          ) : (
            mockUsers.map((user, index) => (
              <React.Fragment key={user.id}>
                <Box sx={{ 
                  p: 2, 
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2
                }}>
                  {/* Info del Usuario */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#e0e0e0', color: '#666', fontWeight: 'bold' }}>
                      {getInitials(user.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold" color="#212121" lineHeight={1.2}>
                        {user.name}
                      </Typography>
                      <Typography variant="body2" color="#666666">
                        {user.id} · {user.email}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Acción */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                    width: { xs: '100%', sm: 'auto' },
                    gap: 2
                  }}>
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => handleOpenModal(user)}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', py: 0.5 }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
                {/* Divisor entre usuarios, excepto el último */}
                {index < mockUsers.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Paper>

        {/* AUDITORÍA DE ELIMINACIONES Y CREACIONES */}
        <Typography variant="h6" sx={{ color: '#212121', mb: 2, fontWeight: 'bold' }}>
          Auditoría de eliminaciones y creaciones
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {auditLogs.map((log, index) => (
            <React.Fragment key={log.id}>
              <Box sx={{ 
                p: 2, 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2
              }}>
                {/* Fecha y Etiqueta */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '220px' }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {log.date}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold',
                    bgcolor: log.isCreation ? '#e8f5e9' : '#ffebee',
                    color: log.isCreation ? '#2e7d32' : '#c62828'
                  }}>
                    {log.action}
                  </Typography>
                </Box>
                
                {/* Detalles del Log */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="#212121">
                    {log.details}
                  </Typography>
                </Box>

                {/* Rol */}
                <Box>
                  <Typography variant="body2" color="#666">
                    {log.role}
                  </Typography>
                </Box>

              </Box>
              {index < auditLogs.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Paper>

      </Box>

      {/* MODAL DE ELIMINACIÓN */}
      <DeleteAdminModal 
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        adminData={selectedAdmin}
      />

      {/* TOAST NOTIFICACIÓN DE ÉXITO */}
      <Snackbar 
        open={toastOpen} 
        autoHideDuration={4000} 
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ mb: { xs: 8, md: 0 } }} // Elevar un poco en móvil para que no choque con la barra
      >
        <Alert 
          onClose={() => setToastOpen(false)} 
          severity="success" 
          sx={{ width: '100%', bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 2 }}
        >
          Administrador eliminado correctamente.
        </Alert>
      </Snackbar>

      {/* BOTTOM NAVIGATION (Solo visible en pantallas pequeñas) */}
      <Box sx={{ 
        display: { xs: 'block', sm: 'none' }, 
        position: 'fixed', 
        bottom: 0, left: 0, right: 0, 
        zIndex: 1000, 
        borderTop: '1px solid #e0e0e0' 
      }}>
        <BottomNavigation
          showLabels
          value={navValue}
          onChange={(event, newValue) => {
            setNavValue(newValue);
          }}
          sx={{
            '& .Mui-selected': {
              color: '#e65100', // Naranja del mockup
            }
          }}
        >
          <BottomNavigationAction label="Acceso" value="acceso" icon={<VpnKeyIcon />} />
          <BottomNavigationAction label="Mensajeros" value="mensajeros" icon={<LocalShippingIcon />} />
          <BottomNavigationAction label="Admins" value="admins" icon={<AdminPanelSettingsIcon />} />
          <BottomNavigationAction label="Permisos" value="permisos" icon={<SecurityIcon />} />
        </BottomNavigation>
      </Box>

    </Box>
  );
};

export default AdminManagement;