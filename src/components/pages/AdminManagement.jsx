import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import DeleteAdminModal from '../components/DeleteAdminModal';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Datos quemados simulando al administrador que se va a eliminar (basado en el video)
  const mockAdmin = {
    id: '1-0678-0456',
    name: 'Luis Diego Araya',
    email: 'l.araya@blawdgourmet.com'
  };

  const handleOpenModal = () => {
    setSelectedAdmin(mockAdmin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
  };

  const handleDeleteConfirm = (adminId) => {
    console.log(`Ejecutando eliminación en BD para el admin con ID: ${adminId}`);
    // Aquí luego integraremos la llamada a la API (Service)
    setIsModalOpen(false);
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f3ef', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ color: '#1b3e32', mb: 4, fontWeight: 'bold' }}>
        Módulo de Administradores
      </Typography>
      
      {/* Botón temporal solo para abrir el modal */}
      <Button 
        variant="outlined" 
        color="error" 
        onClick={handleOpenModal}
        sx={{ textTransform: 'none', fontWeight: 'bold' }}
      >
        Probar Modal de Eliminación
      </Button>

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