import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useCourier } from '../hooks/useCourier';
import { listCouriers } from '../services/CourierService';
import { getInitials } from '../utils/getInitials';
import Toast from '../components/Toast';
import StatusMessage from '../components/StatusMessage';
import './EditMessenger.css';

export function EditMessenger({ initialCedula = '' }) {
  const { user, logout } = useAuth();
  const { loading: submitting, updateCourier, getCourierByCedula } = useCourier();

  const [couriersList, setCouriersList] = useState([]);
  const [currentCourier, setCurrentCourier] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    schedule: '',
    maxLoadCapacityKg: '',
    password: '',
    status: 'ACTIVE'
  });

  const [formErrors, setFormErrors] = useState({});
  const [initialFormValues, setInitialFormValues] = useState(null);

  // Toast & Notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [updateError, setUpdateError] = useState(null);

  // Historial de modificaciones (Log) — debe cargarse desde el backend
  const [changeLog, setChangeLog] = useState([]);

  // Normalizar cédula para búsqueda insensible a tipo de documento o formato
  const normalizeId = (id) => (id || '').toString().replace(/[-\s]/g, '').toLowerCase();

  const getCourierId = (courier) => 
    courier.documentNumber || courier.idCard || courier.cedula || courier.id || courier.nationalId;

  const loadCouriersList = useCallback(async () => {
    setIsLoadingCouriers(true);
    try {
      const data = await listCouriers();
      setCouriersList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar la flota de mensajeros:', err);
      setCouriersList([]);
    } finally {
      setIsLoadingCouriers(false);
    }
  }, []);

  useEffect(() => {
    loadCouriersList();
  }, [loadCouriersList]);

  const loadMessengerData = (courier) => {
    setCurrentCourier(courier);
    setSelectedCourierId(getCourierId(courier));
    const initialVals = {
      fullName: courier.fullName || courier.nombre || '',
      schedule: courier.schedule || courier.horario || '',
      maxLoadCapacityKg: courier.maxLoadCapacityKg || courier.cap || courier.capacidad || '',
      password: '',
      status: courier.status || (courier.estado === 'Inactivo' ? 'INACTIVE' : 'ACTIVE')
    };
    setFormData(initialVals);
    setInitialFormValues(initialVals);
    setFormErrors({});
    setUpdateError(null);
  };

  const handleRowClick = (courier) => {
    loadMessengerData(courier);
  };

  // Cargar por cédula inicial si se proporciona
  useEffect(() => {
    if (initialCedula && couriersList.length > 0) {
      const normInitial = normalizeId(initialCedula);
      const found = couriersList.find((m) =>
        normalizeId(getCourierId(m)) === normInitial
      );
      if (found) {
        loadMessengerData(found);
      }
    }
  }, [initialCedula, couriersList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'El nombre completo es requerido.';
    }

    if (!formData.schedule.trim()) {
      errors.schedule = 'El horario es requerido.';
    }

    const capNum = Number(formData.maxLoadCapacityKg);
    if (!formData.maxLoadCapacityKg.toString().trim() || isNaN(capNum) || capNum <= 0) {
      errors.maxLoadCapacityKg = 'La capacidad máxima de carga debe ser un valor numérico positivo.';
    }

    if (formData.password && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStatusToggle = () => {
    if (!currentCourier) return;

    const inLabor = currentCourier.inLabor || currentCourier.enLabores || false;
    const pendingPackages = currentCourier.pendingPackages || currentCourier.pendientes || 0;

    // Criterio de aceptación 2: Debe realizarse antes de que tenga envíos en proceso y fuera de sus labores
    if (inLabor || pendingPackages > 0) {
      const reason = inLabor
        ? 'El mensajero se encuentra actualmente en labores.'
        : `El mensajero tiene ${pendingPackages} envío(s) en proceso.`;

      setToast({
        open: true,
        message: `Cualquier cambio de estado del mensajero debe realizarse antes de que tenga envíos en proceso y únicamente cuando se encuentre fuera de sus labores. (${reason})`,
        severity: 'warning'
      });
      return;
    }

    const newStatus = formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setFormData((prev) => ({ ...prev, status: newStatus }));

    if (newStatus === 'INACTIVE') {
      // Criterio de aceptación 1: Cualquier cambio en el estado de acceso debe cerrar de forma inmediata la sesión activa
      setToast({
        open: true,
        message: 'Cambio en el estado de acceso: La sesión activa del mensajero se cerrará de inmediato.',
        severity: 'warning'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentCourier) return;

    if (!validateForm()) {
      setToast({
        open: true,
        message: 'Por favor corrija los errores en el formulario antes de guardar.',
        severity: 'error'
      });
      return;
    }

    setUpdateError(null);

    const idCard = currentCourier.documentNumber || currentCourier.idCard || currentCourier.cedula || currentCourier.id;

    // Detectar campos modificados para el log
    const modifiedFields = [];
    if (formData.fullName !== initialFormValues.fullName) {
      modifiedFields.push(`Nombre: ${initialFormValues.fullName} → ${formData.fullName}`);
    }
    if (formData.schedule !== initialFormValues.schedule) {
      modifiedFields.push(`Horario: ${initialFormValues.schedule} → ${formData.schedule}`);
    }
    if (String(formData.maxLoadCapacityKg) !== String(initialFormValues.maxLoadCapacityKg)) {
      modifiedFields.push(`Capacidad: ${initialFormValues.maxLoadCapacityKg} kg → ${formData.maxLoadCapacityKg} kg`);
    }
    if (formData.password) {
      modifiedFields.push('Contraseña actualizada');
    }
    if (formData.status !== initialFormValues.status) {
      const oldState = initialFormValues.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
      const newState = formData.status === 'ACTIVE' ? 'Activo' : 'Inactivo';
      modifiedFields.push(`Estado de acceso: ${oldState} → ${newState} (Sesión cerrada inmediatamente)`);
    }

    if (modifiedFields.length === 0) {
      setToast({
        open: true,
        message: 'No se detectaron cambios en la información del mensajero.',
        severity: 'warning'
      });
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName,
        schedule: formData.schedule,
        maxLoadCapacityKg: Number(formData.maxLoadCapacityKg),
        status: formData.status,
        ...(formData.password ? { password: formData.password } : {})
      };

      await updateCourier(idCard, payload);

      // Criterio de aceptación 3: Registrar historial de modificaciones (log)
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: Date.now(),
        when: `${dateStr} · ${timeStr}`,
        text: modifiedFields.join(' | '),
        by: user?.fullName || 'Súper Usuario'
      };

      setChangeLog((prev) => [newLog, ...prev]);

      // Actualizar estado local
      const updatedCourier = {
        ...currentCourier,
        fullName: formData.fullName,
        schedule: formData.schedule,
        maxLoadCapacityKg: Number(formData.maxLoadCapacityKg),
        status: formData.status,
        estado: formData.status === 'ACTIVE' ? 'Activo' : 'Inactivo'
      };
      setCurrentCourier(updatedCourier);
      setInitialFormValues({ ...formData, password: '' });
      setFormData((prev) => ({ ...prev, password: '' }));

      setToast({
        open: true,
        message: 'Notificación de actualización exitosa. Los datos del mensajero han sido modificados.',
        severity: 'success'
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar la información del mensajero.';
      setUpdateError(errorMessage);
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  const handleReset = () => {
    if (initialFormValues) {
      setFormData(initialFormValues);
      setFormErrors({});
      setUpdateError(null);
    }
  };

  const inLabor = currentCourier?.inLabor || currentCourier?.enLabores || false;
  const pendingPackages = currentCourier?.pendingPackages || currentCourier?.pendientes || 0;
  const isStatusDisabled = inLabor || pendingPackages > 0;

  return (
    <Box className="edit-messenger-container">
      {/* Flota de Mensajeros — cuadro blanco que encapsula todo */}
      <Paper elevation={0} sx={{ borderRadius: 16, border: '1px solid #E4DED7', mb: 4, bgcolor: '#ffffff', overflowX: 'auto' }}>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" className="edit-messenger-title" sx={{ fontSize: 22 }}>
            Flota de mensajeros
          </Typography>
          <Typography variant="body2" className="edit-messenger-subtitle" sx={{ fontSize: 14, color: '#6B6560' }}>
            Selecciona un mensajero para editar sus datos
          </Typography>
        </Box>
        <Table sx={{ minWidth: 600, width: '100%' }}>
          <TableHead>
              <TableRow>
                <TableCell component="th" scope="col" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '0.5px' }}>Mensajero</TableCell>
                <TableCell component="th" scope="col" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '0.5px' }}>Cédula</TableCell>
                <TableCell component="th" scope="col" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '0.5px' }}>Horario</TableCell>
                <TableCell component="th" scope="col" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '0.5px' }}>Carga</TableCell>
                <TableCell component="th" scope="col" sx={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '0.5px' }}>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {couriersList.map((courier) => {
                const courierId = getCourierId(courier);
                const isSelected = selectedCourierId === courierId;
                const rowBg = isSelected ? '#F7F3EE' : '#ffffff';
                const avatarBg = isSelected ? '#1A3C34' : '#F5F0EB';
                const avatarColor = isSelected ? '#ffffff' : '#5E564E';
                
                return (
                  <TableRow
                    key={courierId}
                    sx={{ bgcolor: rowBg, cursor: 'pointer', ':hover': { bgcolor: '#F0E9E5' } }}
                    onClick={() => handleRowClick(courier)}
                  >
                    <TableCell component="td" sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: avatarBg,
                          color: avatarColor,
                          fontWeight: 'bold',
                          width: 32,
                          height: 32
                        }}
                      >
                        {getInitials(courier.fullName || courier.nombre)}
                      </Avatar>
                      <span sx={{ fontWeight: 500, color: '#1F2421' }}>{courier.fullName || courier.nombre}</span>
                    </TableCell>
                    <TableCell component="td" sx={{ px: 4, py: 3, fontSize: 12, color: '#5E564E' }}>
                      {courier.documentNumber || courier.idCard || courier.cedula || courier.id || ''}
                    </TableCell>
                    <TableCell component="td" sx={{ px: 4, py: 3, fontSize: 12, color: '#5E564E' }}>
                      {courier.schedule || courier.horario || ''}
                    </TableCell>
                    <TableCell component="td" sx={{ px: 4, py: 3, fontSize: 12, color: '#5E564E' }}>
                      {courier.maxLoadCapacityKg || courier.cap || courier.capacidad || ''} kg
                    </TableCell>
                    <TableCell component="td" sx={{ px: 4, py: 3, fontSize: 12, color: '#5E564E' }}>
                      {courier.status === 'ACTIVE' || !courier.estado ? (
                        <Chip
                          label='Activo'
                          size="small"
                          sx={{ bgcolor: '#E9F3EC', color: '#2F7D4F', fontWeight: 600 }}
                        />
                      ) : (
                        <Chip
                          label='Inactivo'
                          size="small"
                          sx={{ bgcolor: '#FCEDEA', color: '#C0392B', fontWeight: 600 }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {couriersList.length === 0 && (
                <TableRow>
                  <TableCell component="td" colSpan={7} sx={{ textAlign: 'center', py: 12, color: '#9E968D' }}>
                    No hay mensajeros disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        </Paper>

      {/* Formulario de Edición */}
      {currentCourier ? (
        <Paper elevation={0} sx={{ borderRadius: 16, border: '1px solid #E4DED7', p: { xs: 2.5, md: 4 }, mb: 4, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 3, borderBottom: '1px solid #E4DED7', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1A3C34', color: '#ffffff', fontWeight: 'bold', width: 44, height: 44 }}>
                {getInitials(currentCourier.fullName || currentCourier.nombre)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#1A3C34', fontWeight: 600, fontSize: 18 }}>
                  Editar · {currentCourier.fullName || currentCourier.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9E968D', fontSize: 13 }}>
                  Cédula {currentCourier.documentNumber || currentCourier.idCard || currentCourier.cedula || currentCourier.id} · no editable
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, width: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px' }}>
                  Nombre completo *
                </Typography>
                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={Boolean(formErrors.fullName)}
                  helperText={formErrors.fullName}
                  placeholder="Nombre y apellidos"
                  InputProps={{ sx: { borderRadius: 2, fontSize: 14.5, border: '1.5px solid #DCD4CA' } }}
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#DCD4CA' } } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px' }}>
                  Horario *
                </Typography>
                <TextField
                  fullWidth
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  error={Boolean(formErrors.schedule)}
                  helperText={formErrors.schedule}
                  placeholder="Ej. 6:00 am – 2:00 pm"
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#DCD4CA' } } }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, width: '100%' }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px' }}>
                  Capacidad máxima de carga (kg) *
                </Typography>
                <TextField
                  fullWidth
                  name="maxLoadCapacityKg"
                  type="number"
                  value={formData.maxLoadCapacityKg}
                  onChange={handleChange}
                  error={Boolean(formErrors.maxLoadCapacityKg)}
                  helperText={formErrors.maxLoadCapacityKg}
                  placeholder="Valor positivo (ej. 25)"
                  inputProps={{ min: "1", step: "any" }}
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#DCD4CA' } } }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.5px' }}>
                  Nueva contraseña (opcional)
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(formErrors.password)}
                  helperText={formErrors.password || 'Dejar vacío para no cambiar'}
                  placeholder="••••••••"
                  sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 2, '& fieldset': { borderColor: '#DCD4CA' } } }}
                />
              </Box>
            </Box>

            {/* Estado de acceso */}
            <Box sx={{ backgroundColor: '#F1ECE7', borderRadius: 3, padding: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2421', fontSize: 15 }}>
                  Estado de acceso
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B6560', display: 'block', fontSize: 13, mt: 0.5 }}>
                  {formData.status === 'ACTIVE'
                    ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.'
                    : 'Revocado. El mensajero no puede iniciar sesión.'}
                </Typography>
                {isStatusDisabled && (
                  <Typography variant="caption" sx={{ color: '#C0392B', fontWeight: 600, mt: 0.5, display: 'block', fontSize: 11 }}>
                    Solo puedes cambiar el estado fuera de labores y sin envíos en proceso.
                  </Typography>
                )}
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'ACTIVE'}
                    onChange={handleStatusToggle}
                    disabled={isStatusDisabled}
                    color="success"
                    sx={{ '& .MuiSwitch-thumb': { width: 18, height: 18 }, '& .MuiSwitch-track': { height: 22, borderRadius: 11 } }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A3C34', fontSize: 13 }}>
                    {formData.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>

            {updateError && <StatusMessage severity="error" message={updateError} />}

            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: '#1A3C34',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: '#122921' }
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar cambios'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={submitting}
                sx={{
                  color: '#1A3C34',
                  borderColor: '#DCD4CA',
                  fontWeight: 'bold',
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  borderRadius: 2
                }}
              >
                Descartar
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 16, border: '1px solid #E4DED7', p: 4, textAlign: 'center', bgcolor: '#ffffff', mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#6B6560', fontSize: 14 }}>
            Selecciona un mensajero de la flota arriba para editar sus datos.
          </Typography>
        </Paper>
      )}

      {/* Historial de Modificaciones (Log) */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E4DED7', overflow: 'hidden', bgcolor: '#ffffff' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E4DED7', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h6" sx={{ color: '#1A3C34', fontWeight: 600 }}>
            Historial de modificaciones
          </Typography>
          <Chip label={`${changeLog.length} registros`} size="small" sx={{ bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 600 }} />
        </Box>
        <Box>
          {changeLog.map((log) => (
            <Box key={log.id} className="history-log-item">
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#9E968D', minWidth: '150px' }}>
                {log.when}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1F2421', flex: 1 }}>
                {log.text}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6B6560' }}>
                {log.by}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Componente Toast para Notificaciones */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
}

export default EditMessenger;
