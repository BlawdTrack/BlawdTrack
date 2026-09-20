import React, { useState, useEffect } from 'react';
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
  BottomNavigationAction,
  CircularProgress
} from '@mui/material';

import DeleteAdminModal from '../components/DeleteAdminModal';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);

  // Estados limpios: arreglos vacíos sin datos falsos
  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  // Estados para manejar la carga de la API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Puente de conexión HTTP hacia Java/Spring Boot y MySQL
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        // Reemplaza esta URL con el endpoint exacto que te dé tu compañero de backend
        const response = await fetch('http://localhost:8080/api/administradores'); 
        if (!response.ok) throw new Error('Error al conectar con el servidor');
        
        const data = await response.json();
        setAdmins(data);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleOpenModal = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteConfirm = async (adminId) => {
    // Aquí idealmente también harías un fetch con el método DELETE al backend
    // await fetch(`http://localhost:8080/api/administradores/${adminId}`, { method: 'DELETE' });
    
    const adminToDelete = admins.find(u => u.id === adminId);
    
    // 1. Actualizar estado local
    setAdmins(admins.filter(u => u.id !== adminId));

    // 2. Crear registro de auditoría local
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

    setAuditLogs([newLog, ...auditLogs]);

    // 3. Cerrar modal y mostrar alerta
    setIsModalOpen(false);
    setToastOpen(true);
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f3ef', minHeight: '100vh', pb: { xs: 12, md: 4 } }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        
        {/* BUSCADOR */}
        <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Typography variant="overline" sx={{ color: '#666', fontWeight: 'bold', display: 'block', mb: 1 }}>
            BUSCAR ADMINISTRADOR POR CÉDULA
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField 
              fullWidth variant="outlined" placeholder="1-2345-6789" size="small" sx={{ bgcolor: '#fff' }}
            />
            <Button 
              variant="contained" disableElevation
              sx={{ bgcolor: '#1b3e32', color: '#fff', fontWeight: 'bold', px: 4, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#122921' } }}
            >
              Buscar
            </Button>
          </Box>
        </Paper>

        {/* LISTA DE ADMINISTRADORES */}
        <Typography variant="h6" sx={{ color: '#212121', mb: 2, fontWeight: 'bold' }}>
          Administradores
        </Typography>
        
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden', mb: 4 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#1b3e32' }} />
            </Box>
          ) : error ? (
            <Typography variant="body1" sx={{ p: 3, color: '#d32f2f', textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </Typography>
          ) : admins.length === 0 ? (
            <Typography variant="body1" sx={{ p: 3, color: '#666', textAlign: 'center' }}>
              No hay administradores registrados.
            </Typography>
          ) : (
            admins.map((user, index) => (
              <React.Fragment key={user.id}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 2 }}>
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
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-end', sm: 'flex-end' }, width: { xs: '100%', sm: 'auto' } }}>
                    <Button 
                      variant="outlined" color="error" onClick={() => handleOpenModal(user)}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 'bold', py: 0.5 }}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
                {index < admins.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Paper>

        {/* AUDITORÍA */}
        <Typography variant="h6" sx={{ color: '#212121', mb: 2, fontWeight: 'bold' }}>
          Auditoría de eliminaciones y creaciones
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
          {auditLogs.length === 0 ? (
            <Typography variant="body1" sx={{ p: 3, color: '#666', textAlign: 'center' }}>
              No hay registros de auditoría recientes.
            </Typography>
          ) : (
            auditLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: '220px' }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>{log.date}</Typography>
                    <Typography variant="caption" sx={{ px: 1.5, py: 0.5, borderRadius: 1.5, fontWeight: 'bold', bgcolor: log.isCreation ? '#e8f5e9' : '#ffebee', color: log.isCreation ? '#2e7d32' : '#c62828' }}>
                      {log.action}
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}><Typography variant="body2" color="#212121">{log.details}</Typography></Box>
                  <Box><Typography variant="body2" color="#666">{log.role}</Typography></Box>
                </Box>
                {index < auditLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Paper>

      </Box>

      {/* MODAL */}
      <DeleteAdminModal open={isModalOpen} onClose={handleCloseModal} onConfirm={handleDeleteConfirm} adminData={selectedAdmin} />

      {/* TOAST */}
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} sx={{ mb: { xs: 12, md: 0 } }}>
        <Alert severity="success" sx={{ width: '100%', bgcolor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9', borderRadius: 2 }}>
          Administrador eliminado correctamente.
        </Alert>
      </Snackbar>

      {/* NAVEGACIÓN MÓVIL EXACTA AL MOCKUP */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, bgcolor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: '0px -4px 12px rgba(0,0,0,0.05)', pt: 1, pb: 2 }}>
        <BottomNavigation showLabels value="admins" sx={{ bgcolor: 'transparent', height: 'auto', '& .MuiBottomNavigationAction-root': { minWidth: 'auto', padding: '8px 0' }, '& .Mui-selected': { color: '#ff6d00 !important' }, '& .MuiBottomNavigationAction-label': { fontSize: '0.75rem', fontWeight: '600', mt: 0.5 } }}>
          <BottomNavigationAction label="Acceso" value="acceso" icon={<Box sx={{ width: 26, height: 26, bgcolor: '#e0e0e0', borderRadius: 1.5 }} />} />
          <BottomNavigationAction label="Mensajeros" value="mensajeros" icon={<Box sx={{ width: 26, height: 26, bgcolor: '#e0e0e0', borderRadius: 1.5 }} />} />
          <BottomNavigationAction label="Admins" value="admins" icon={<Box sx={{ width: 28, height: 28, bgcolor: '#ff6d00', borderRadius: 2 }} />} />
          <BottomNavigationAction label="Permisos" value="permisos" icon={<Box sx={{ width: 26, height: 26, bgcolor: '#e0e0e0', borderRadius: 1.5 }} />} />
        </BottomNavigation>
      </Box>
    </Box>
  );
};

export default AdminManagement;