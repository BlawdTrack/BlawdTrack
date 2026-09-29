import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  Avatar,
  Paper,
  Divider,
  Snackbar,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';

import DeleteAdminModal from '../components/DeleteAdminModal';
import { deleteAdministrator, getAdministrators, getAdminAuditLog } from '../services/AdminService';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_PLACEHOLDERS } from '../config/documentTypes';

const normalizeDocument = (value) => (value || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Backend action codes (AuditServiceImpl / AdminServiceImpl) -> presentation.
const AUDIT_ACTION_LABELS = {
  CREAR_ADMINISTRADOR: { label: 'Creación', isCreation: true },
  ELIMINAR_ADMINISTRADOR: { label: 'Eliminación', isCreation: false },
};

// Maps GET /v1/admins/audit-log rows to what the list below renders.
const mapAuditLogEntry = (entry) => {
  const meta = AUDIT_ACTION_LABELS[entry.action] || { label: entry.action, isCreation: false };
  const when = new Date(entry.timestamp);
  return {
    id: entry.id,
    date: `${when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · ${when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`,
    action: meta.label,
    isCreation: meta.isCreation,
    details: entry.details,
    role: 'Súper Usuario',
  };
};

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

/**
 * Pantalla "Eliminar administrador" (HU-008), exclusiva del Super Usuario. Lista los administradores de
 * ventas (`GET /api/v1/admins`), permite buscarlos por tipo y número de documento y abre
 * `DeleteAdminModal` para confirmar. Un administrador con sesión activa no se puede eliminar; los
 * errores del backend (404 y 409) se muestran en el modal y en una notificación.
 */
const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchDocumentType, setSearchDocumentType] = useState('CEDULA');
  const [searchDocumentNumber, setSearchDocumentNumber] = useState('');
  const [appliedFilter, setAppliedFilter] = useState(null);

  const fetchAuditLog = async () => {
    try {
      const data = await getAdminAuditLog();
      setAuditLogs(data.map(mapAuditLogEntry));
    } catch (err) {
      // The audit list is secondary to the admin list; a failure here does not
      // block the page, it just leaves the "no hay registros" placeholder.
      console.error('Error al cargar el historial de auditoría:', err);
    }
  };

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
    fetchAuditLog();
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

      setAdmins((currentAdmins) =>
        currentAdmins.filter(
          (admin) =>
            admin.documentNumber !== cedula
            && admin.identification !== cedula
            && admin.nationalId !== cedula
            && admin.id !== cedula
        )
      );

      // The backend already wrote the audit entry (registrarEliminacionAdministrador);
      // refetch instead of guessing its shape locally.
      fetchAuditLog();

      closeDeleteModal();
      setToastOpen(true);
    } catch (err) {
      console.error('Error al eliminar administrador:', err);
      setDeleteError(getDeleteErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    const trimmed = searchDocumentNumber.trim();
    if (!trimmed) {
      setAppliedFilter(null);
      return;
    }
    setAppliedFilter({ documentType: searchDocumentType, documentNumber: normalizeDocument(trimmed) });
  };

  const handleClearSearch = () => {
    setSearchDocumentNumber('');
    setAppliedFilter(null);
  };

  const visibleAdmins = appliedFilter
    ? admins.filter(
        (admin) =>
          admin.documentType === appliedFilter.documentType
          && normalizeDocument(admin.documentNumber).includes(appliedFilter.documentNumber)
      )
    : admins;

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Box sx={{ maxWidth: '1400px', margin: '0 auto', p: { xs: 2.5, sm: '40px 32px' }, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BUSCADOR */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Buscar administrador por documento
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: '20px 24px' }, display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
          <TextField
            select
            value={searchDocumentType}
            onChange={(e) => setSearchDocumentType(e.target.value)}
            sx={{ flex: '0 0 150px', minWidth: 130, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#DCD4CA', borderWidth: '1.5px' } } }}
          >
            {DOCUMENT_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            value={searchDocumentNumber}
            onChange={(e) => setSearchDocumentNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={DOCUMENT_PLACEHOLDERS[searchDocumentType]}
            sx={{ flex: '1 1 auto', minWidth: 0, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#DCD4CA', borderWidth: '1.5px' } } }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleSearch}
            sx={{
              flex: '0 0 auto',
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
          {appliedFilter && (
            <Button
              onClick={handleClearSearch}
              sx={{ flex: '0 0 auto', color: '#6B6560', textTransform: 'none', fontWeight: 600, px: 1.5 }}
            >
              Limpiar
            </Button>
          )}
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
          ) : visibleAdmins.length === 0 ? (
            <Alert severity="info" sx={{ m: 2 }}>
              No se encontró ningún administrador con ese documento.
            </Alert>
          ) : (
            visibleAdmins.map((user, index) => {
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
