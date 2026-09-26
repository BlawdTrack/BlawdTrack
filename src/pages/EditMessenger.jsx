import React, { useState, useEffect } from 'react';
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
  FormControlLabel
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

  const [searchCedula, setSearchCedula] = useState(initialCedula);
  const [currentCourier, setCurrentCourier] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  // Historial de modificaciones (Log)
  const [changeLog, setChangeLog] = useState([
    {
      id: 1,
      when: '26/09/2026 · 09:30',
      text: 'Horario actualizado: 5:00 am – 1:00 pm → 6:00 am – 2:00 pm',
      by: 'Súper Usuario'
    },
    {
      id: 2,
      when: '25/09/2026 · 14:15',
      text: 'Capacidad máxima de carga: 20 kg → 25 kg',
      by: 'Súper Usuario'
    }
  ]);

  // Normalizar cédula para búsqueda insensible a tipo de documento o formato
  const normalizeId = (id) => (id || '').toString().replace(/[-\s]/g, '').toLowerCase();

  const loadMessengerData = (courier) => {
    setCurrentCourier(courier);
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

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchCedula.trim();
    if (!query) {
      setSearchError('Por favor ingrese la cédula del mensajero a buscar.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Intentar obtener de API
      const fetched = await getCourierByCedula(query);
      if (fetched) {
        loadMessengerData(fetched);
        setToast({
          open: true,
          message: `Mensajero ${fetched.fullName || fetched.nombre} cargado correctamente.`,
          severity: 'success'
        });
        setIsSearching(false);
        return;
      }
    } catch (err) {
      // Buscar en lista local de respaldo si la API no encuentra o no responde
      try {
        const list = await listCouriers();
        const normQuery = normalizeId(query);
        const found = list.find((m) =>
          normalizeId(m.documentNumber || m.idCard || m.cedula || m.id || m.nationalId) === normQuery
        );

        if (found) {
          loadMessengerData(found);
          setSearchError(null);
          setToast({
            open: true,
            message: `Mensajero ${found.fullName || found.nombre} encontrado.`,
            severity: 'success'
          });
          setIsSearching(false);
          return;
        }
      } catch (listErr) {
        console.error('Error al listar mensajeros:', listErr);
      }

      const msg = err.response?.data?.message || 'Mensajero no encontrado con la cédula proporcionada.';
      setSearchError(msg);
      setCurrentCourier(null);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialCedula) {
      handleSearch();
    } else {
      // Cargar el primer mensajero por defecto si existe en lista
      listCouriers()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSearchCedula(data[0].documentNumber || data[0].idCard || data[0].cedula || '');
            loadMessengerData(data[0]);
          }
        })
        .catch(() => {});
    }
  }, [initialCedula]);

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
      {/* Encabezado */}
      <Box className="edit-messenger-header">
        <Typography variant="h5" className="edit-messenger-title">
          Editar Mensajero
        </Typography>
        <Typography variant="body2" className="edit-messenger-subtitle">
          Actualizar datos de contacto, capacidad de carga y reglas de acceso operativo del personal.
        </Typography>
      </Box>

      {/* Buscador de Mensajero por Cédula */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E4DED7', p: 3, mb: 4, bgcolor: '#ffffff' }}>
        <Typography variant="overline" sx={{ color: '#1A3C34', fontWeight: 'bold', letterSpacing: '0.8px', display: 'block', mb: 1 }}>
          BÚSQUEDA DE MENSAJERO POR CÉDULA / IDENTIFICACIÓN
        </Typography>
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ingrese cédula o número de documento (ej. 1-0345-0678)"
            value={searchCedula}
            onChange={(e) => setSearchCedula(e.target.value)}
            sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isSearching}
            sx={{ bgcolor: '#1A3C34', color: '#ffffff', fontWeight: 'bold', px: 4, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#122921' } }}
          >
            {isSearching ? <CircularProgress size={24} color="inherit" /> : 'Buscar'}
          </Button>
        </Box>
        <Typography variant="caption" sx={{ color: '#9E968D', mt: 1, display: 'block' }}>
          La búsqueda funciona independientemente del tipo de documento con el que fue registrado.
        </Typography>
        {searchError && (
          <Box sx={{ mt: 2 }}>
            <StatusMessage severity="error" message={searchError} />
          </Box>
        )}
      </Paper>

      {/* Formulario de Edición */}
      {currentCourier ? (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E4DED7', p: { xs: 2.5, md: 4 }, mb: 4, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 3, borderBottom: '1px solid #E4DED7', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1A3C34', color: '#ffffff', fontWeight: 'bold', width: 44, height: 44 }}>
                {getInitials(currentCourier.fullName || currentCourier.nombre)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ color: '#1A3C34', fontWeight: 600 }}>
                  Editar · {currentCourier.fullName || currentCourier.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: '#9E968D' }}>
                  Cédula {currentCourier.documentNumber || currentCourier.idCard || currentCourier.cedula || currentCourier.id} · no editable
                </Typography>
              </Box>
            </Box>
            <Chip
              label={formData.status === 'ACTIVE' ? 'Acceso Habilitado' : 'Acceso Revocado'}
              sx={{
                bgcolor: formData.status === 'ACTIVE' ? '#E9F3EC' : '#FCEDEA',
                color: formData.status === 'ACTIVE' ? '#2F7D4F' : '#C0392B',
                fontWeight: 700
              }}
            />
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block' }}>
                  NOMBRE COMPLETO *
                </Typography>
                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={Boolean(formErrors.fullName)}
                  helperText={formErrors.fullName}
                  placeholder="Nombre y apellidos"
                  sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block' }}>
                  HORARIO *
                </Typography>
                <TextField
                  fullWidth
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  error={Boolean(formErrors.schedule)}
                  helperText={formErrors.schedule}
                  placeholder="Ej. 6:00 am – 2:00 pm"
                  sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block' }}>
                  CAPACIDAD MÁXIMA DE CARGA POR PAQUETE (KG) *
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
                  sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#6B6560', mb: 0.8, display: 'block' }}>
                  NUEVA CONTRASEÑA (OPCIONAL)
                </Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(formErrors.password)}
                  helperText={formErrors.password || 'Dejar vacío si no desea modificar la contraseña'}
                  placeholder="••••••••"
                  sx={{ bgcolor: '#ffffff', borderRadius: 2 }}
                />
              </Box>
            </Box>

            {/* Toggle de Estado de Acceso */}
            <Box className="access-toggle-container">
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1F2421' }}>
                  Estado de acceso operativo
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B6560', display: 'block' }}>
                  {formData.status === 'ACTIVE'
                    ? 'Acceso activo. Al desactivarlo, se cerrará de inmediato la sesión del mensajero.'
                    : 'Acceso revocado. El mensajero no puede iniciar sesión ni realizar entregas.'}
                </Typography>
                {isStatusDisabled && (
                  <Typography variant="caption" sx={{ color: '#C9860F', fontWeight: 600, mt: 0.5, display: 'block' }}>
                    Cualquier cambio de estado debe realizarse antes de tener envíos en proceso y estando fuera de labores.
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
                  />
                }
                label={formData.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
              />
            </Box>

            {updateError && <StatusMessage severity="error" message={updateError} />}

            {/* Botones de Acción */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ bgcolor: '#1A3C34', color: '#ffffff', fontWeight: 'bold', px: 4, py: 1.5, textTransform: 'none', borderRadius: 2, '&:hover': { bgcolor: '#122921' } }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Guardar cambios'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={submitting}
                sx={{ color: '#1A3C34', borderColor: '#DCD4CA', fontWeight: 'bold', px: 3, py: 1.5, textTransform: 'none', borderRadius: 2 }}
              >
                Descartar
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px solid #E4DED7', bgcolor: '#ffffff', mb: 4 }}>
          <Typography variant="body1" sx={{ color: '#6B6560' }}>
            Ingrese una cédula en el buscador superior para cargar los datos del mensajero a modificar.
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
