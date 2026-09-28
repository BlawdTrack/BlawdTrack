import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress,
} from '@mui/material';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';

import DeleteAdminModal from '../components/DeleteAdminModal';
import { deleteAdministrator, getAdministrators } from '../services/AdminService';
import { ROUTES } from '../config/routes';

const CARD_SX = {
  borderRadius: '18px',
  border: '1px solid #E4DED7',
  bgcolor: '#fff',
  boxShadow: '0 12px 30px rgba(26,60,52,.06)',
};

const CARD_HEADER_SX = {
  p: { xs: 2.5, sm: '18px 24px' },
  borderBottom: '1px solid #E4DED7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1.5,
};

const AdminManagement = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setError(null);
        const data = await getAdministrators();
        setAdmins(data);
      } catch (err) {
        console.error('Error al cargar administradores:', err);
        setError('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleOpenModal = (admin) => {
    setDeleteError(null);
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isDeleting) return;
    closeDeleteModal();
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedAdmin(null);
    setDeleteError(null);
  };

  const getDeleteErrorMessage = (err) => {
    const responseStatus = err.response?.status;
    const backendMessage = err.response?.data?.message;

    if (responseStatus === 404) {
      return 'Administrador no existente.';
    }

    if (responseStatus === 409) {
      return 'No se puede eliminar el administrador porque tiene sesiones activas. Cierre sus sesiones e intente nuevamente.';
    }

    if (responseStatus === 401 || responseStatus === 403) {
      return 'No cuenta con permisos para eliminar administradores.';
    }

    return backendMessage || 'No se pudo eliminar el administrador. Intenta nuevamente.';
  };

  const handleDeleteConfirm = async (documentType, cedula) => {
    if (!documentType || !cedula) {
      console.error('Intento de eliminación fallido: documento indefinido o vacío.');
      handleCloseModal();
      setDeleteError('No se puede procesar la solicitud porque faltan datos del administrador.');
      return;
    }

    try {
      setDeleteError(null);
      setIsDeleting(true);

      await deleteAdministrator(documentType, cedula);

      const adminToDelete = admins.find(
        (admin) =>
          admin.documentNumber === cedula
          || admin.identification === cedula
          || admin.nationalId === cedula
          || admin.id === cedula
      );

      setAdmins((currentAdmins) =>
        currentAdmins.filter(
          (admin) =>
            admin.documentNumber !== cedula
            && admin.identification !== cedula
            && admin.nationalId !== cedula
            && admin.id !== cedula
        )
      );

      if (adminToDelete) {
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });

        const newLog = {
          id: Date.now(),
          date: `${dateStr} · ${timeStr}`,
          action: 'Eliminación',
          details: `Administrador ${adminToDelete.name} - ${cedula}`,
          role: 'Súper Usuario',
          isCreation: false,
        };

        setAuditLogs((currentLogs) => [newLog, ...currentLogs]);
      }

      closeDeleteModal();
      setToastOpen(true);
    } catch (err) {
      console.error('Error al eliminar administrador:', err);
      setDeleteError(getDeleteErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ maxWidth: '1100px', margin: '0 auto', p: { xs: 2.5, sm: '40px 32px' }, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SecurityOutlined />}
          onClick={() => navigate(ROUTES.ROLES_PERMISSIONS)}
          sx={{
            bgcolor: 'primary.main',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            px: 2.5,
            py: '10px',
            '&:hover': { bgcolor: '#12322B' },
          }}
        >
          Gestionar roles y permisos
        </Button>
      </Box>

      {/* BUSCADOR */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Buscar administrador por cédula
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: '20px 24px' }, display: 'flex', gap: 1.5 }}>
          <TextField
            fullWidth
            placeholder="1-2345-6789"
            sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#DCD4CA', borderWidth: '1.5px' } } }}
          />
          <Button
            variant="contained"
            disableElevation
            sx={{
              bgcolor: 'primary.main',
              color: '#fff',
              fontWeight: 600,
              px: 3.5,
              textTransform: 'none',
              borderRadius: '10px',
              '&:hover': { bgcolor: '#12322B' },
            }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      {/* LISTA DE ADMINISTRADORES */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Administradores
          </Typography>
        </Box>

        <Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : admins.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>No hay administradores registrados.</Alert>
          ) : (
            admins.map((user, index) => {
              const blocked = user.hasActiveSession;
              return (
                <React.Fragment key={user.id}>
                  {index > 0 && <Divider sx={{ borderColor: '#EFEAE4' }} />}
                  <Box
                    sx={{
                      p: { xs: 2.5, sm: '18px 24px' },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 700, fontSize: '13px', flex: '0 0 40px' }}>
                        {getInitials(user.name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '14.5px', fontWeight: 600, color: '#1F2421' }}>
                          {user.name}
                        </Typography>
                        <Typography sx={{ fontSize: '12.5px', color: '#6B6560' }}>
                          {user.identification || user.id} · {user.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={blocked ? 'Sesión activa' : 'Sin sesión'}
                        size="small"
                        sx={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          bgcolor: blocked ? '#FCF3E3' : '#F1ECE7',
                          color: blocked ? '#B27A0C' : '#6B6560',
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <Button
                          variant="outlined"
                          disabled={blocked}
                          onClick={() => handleOpenModal(user)}
                          sx={{
                            borderRadius: '10px',
                            px: 2.25,
                            py: '9px',
                            fontWeight: 600,
                            fontSize: '13.5px',
                            textTransform: 'none',
                            bgcolor: '#fff',
                            color: blocked ? '#9E968D' : '#C0392B',
                            borderColor: blocked ? '#DCD4CA' : '#C0392B',
                            '&:hover': { bgcolor: blocked ? '#fff' : '#FCEDEA', borderColor: blocked ? '#DCD4CA' : '#C0392B' },
                          }}
                        >
                          Eliminar
                        </Button>
                        {blocked && (
                          <Typography sx={{ fontSize: '10.5px', color: '#9E968D' }}>
                            Requiere cierre de sesión
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </React.Fragment>
              );
            })
          )}
        </Box>
      </Paper>

      {/* AUDITORÍA */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Auditoría de eliminaciones y creaciones
          </Typography>
        </Box>

        <Box>
          {auditLogs.length === 0 ? (
            <Typography sx={{ p: '20px 24px', fontSize: '13px', color: '#9E968D', textAlign: 'center' }}>
              No hay registros de auditoría recientes.
            </Typography>
          ) : (
            auditLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                {index > 0 && <Divider sx={{ borderColor: '#EFEAE4' }} />}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: '14px 24px' },
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#9E968D', flex: '0 0 150px' }}>
                    {log.date}
                  </Typography>
                  <Chip
                    label={log.action}
                    size="small"
                    sx={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      borderRadius: '20px',
                      bgcolor: log.isCreation ? '#E9F3EC' : '#FCEDEA',
                      color: log.isCreation ? '#2F7D4F' : '#C0392B',
                    }}
                  />
                  <Typography sx={{ fontSize: '13px', color: '#1F2421', flex: '1 1 200px', minWidth: 0 }}>
                    {log.details}
                  </Typography>
                  <Typography sx={{ fontSize: '11.5px', color: '#6B6560' }}>
                    {log.role}
                  </Typography>
                </Box>
              </React.Fragment>
            ))
          )}
        </Box>
      </Paper>

      {/* MODAL */}
      <DeleteAdminModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDeleteConfirm}
        adminData={selectedAdmin}
        errorMessage={deleteError}
        isSubmitting={isDeleting}
      />

      {/* TOAST */}
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setToastOpen(false)} severity="success" variant="filled">
          Administrador eliminado correctamente.
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(deleteError) && !isModalOpen}
        autoHideDuration={6000}
        onClose={() => setDeleteError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setDeleteError(null)} severity="error" variant="filled">
          {deleteError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManagement;
