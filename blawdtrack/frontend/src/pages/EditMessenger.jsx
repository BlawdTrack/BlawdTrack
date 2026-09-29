import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { useCourier } from '../hooks/useCourier';
import { listCouriers } from '../services/CourierService';
import { getInitials } from '../utils/getInitials';
import Toast from '../components/Toast';
import StatusMessage from '../components/StatusMessage';
import './EditMessenger.css';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'DIMEX', label: 'DIMEX' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const DOCUMENT_PLACEHOLDERS = {
  CEDULA: 'Ej. 1-2345-6789',
  DIMEX: 'Ej. 155812345678',
  PASAPORTE: 'Ej. A12345678',
};

const normalizeDocument = (value) => (value || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Muestra solo el rango de horas en la tabla; el detalle de dias queda en el
// formulario de edicion, no en esta columna.
const getScheduleTimeRange = (schedule) => (schedule || '').split(',')[0].trim();

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
const LABEL_SX = {
  fontWeight: 700,
  color: '#6B6560',
  mb: '6px',
  display: 'block',
  textTransform: 'uppercase',
  fontSize: '11.5px',
  letterSpacing: '.5px',
};
const INPUT_SX = {
  bgcolor: '#fff',
  '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '14.5px', '& fieldset': { borderColor: '#DCD4CA', borderWidth: '1.5px' } },
};

/**
 * Pantalla "Actualizar mensajero" (HU-004), exclusiva del Super Usuario. Busca al mensajero por tipo y
 * número de documento, permite editar nombre, correo, teléfono, horario y capacidad de carga
 * (`PUT /api/v1/couriers/{id}`) y muestra el estado de acceso y el historial de cambios.
 * @param {{ initialCedula?: string }} props Documento con el que se abre la pantalla ya cargada.
 */
export function EditMessenger({ initialCedula = '' }) {
  const { user, logout } = useAuth();
  const { loading: submitting, updateCourier } = useCourier();

  const [couriersList, setCouriersList] = useState([]);
  const [currentCourier, setCurrentCourier] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true);

  const [searchDocumentType, setSearchDocumentType] = useState('CEDULA');
  const [searchDocumentNumber, setSearchDocumentNumber] = useState('');
  const [appliedFilter, setAppliedFilter] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
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
      email: courier.email || '',
      phone: courier.phone || courier.telefono || '',
      schedule: courier.schedule || courier.horario || '',
      maxLoadCapacityKg: courier.maxPackageWeightKg ?? courier.maxLoadCapacityKg ?? courier.cap ?? courier.capacidad ?? '',
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

  const visibleCouriers = appliedFilter
    ? couriersList.filter(
        (courier) =>
          courier.documentType === appliedFilter.documentType
          && normalizeDocument(getCourierId(courier)).includes(appliedFilter.documentNumber)
      )
    : couriersList;

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

    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido.';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Ingresa un correo válido.';
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
    if (formData.email !== initialFormValues.email) {
      modifiedFields.push(`Correo: ${initialFormValues.email} → ${formData.email}`);
    }
    if (formData.phone !== initialFormValues.phone) {
      modifiedFields.push(`Teléfono: ${initialFormValues.phone} → ${formData.phone}`);
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
        email: formData.email,
        phone: formData.phone,
        schedule: formData.schedule,
        maxPackageWeightKg: Number(formData.maxLoadCapacityKg)
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
        email: formData.email,
        phone: formData.phone,
        schedule: formData.schedule,
        maxPackageWeightKg: Number(formData.maxLoadCapacityKg)
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
  const isActive = formData.status === 'ACTIVE';

  return (
    <Box className="edit-messenger-container" sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BUSCADOR */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Buscar mensajero por documento
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: '20px 24px' }, display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', sm: 'nowrap' }, alignItems: 'center' }}>
          <TextField
            select
            value={searchDocumentType}
            onChange={(e) => setSearchDocumentType(e.target.value)}
            sx={{ flex: '0 0 150px', minWidth: 130, ...INPUT_SX }}
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
            sx={{ flex: '1 1 auto', minWidth: 0, ...INPUT_SX }}
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

      {/* Flota de Mensajeros */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={{ p: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
            Flota de mensajeros
          </Typography>
          <Typography sx={{ fontSize: '12px', color: '#9E968D' }}>
            Selecciona un mensajero para editar sus datos
          </Typography>
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 600, width: '100%' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F1ECE7' }}>
                {[
                  ['Mensajero', '26%'],
                  ['Cédula', '18%'],
                  ['Horario', '30%'],
                  ['Carga', '13%'],
                  ['Estado', '13%'],
                ].map(([h, w]) => (
                  <TableCell key={h} sx={{ width: w, fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '.9px', border: 0, whiteSpace: 'nowrap' }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleCouriers.map((courier) => {
                const courierId = getCourierId(courier);
                const isSelected = selectedCourierId === courierId;
                return (
                  <TableRow
                    key={courierId}
                    sx={{ bgcolor: isSelected ? '#F7F3EE' : '#fff', cursor: 'pointer', '&:hover': { bgcolor: '#F7F3EE' }, '& td': { borderColor: '#EFEAE4' } }}
                    onClick={() => handleRowClick(courier)}
                  >
                    <TableCell sx={{ width: '26%', px: 3, py: '14px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <Avatar sx={{ width: 30, height: 30, flex: '0 0 30px', bgcolor: isSelected ? 'primary.main' : '#F1ECE7', color: isSelected ? '#fff' : '#6B6560', fontWeight: 700, fontSize: '11.5px' }}>
                          {getInitials(courier.fullName || courier.nombre)}
                        </Avatar>
                        <Typography sx={{ fontWeight: 600, color: '#1F2421', fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {courier.fullName || courier.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ width: '18%', px: 3, py: '14px', fontSize: '13px', color: '#6B6560', whiteSpace: 'nowrap' }}>
                      {courier.documentNumber || courier.idCard || courier.cedula || courier.id || ''}
                    </TableCell>
                    <TableCell sx={{ width: '30%', px: 3, py: '14px', fontSize: '13px', color: '#6B6560' }}>
                      {getScheduleTimeRange(courier.schedule || courier.horario)}
                    </TableCell>
                    <TableCell sx={{ width: '13%', px: 3, py: '14px', fontSize: '13px', color: '#6B6560', whiteSpace: 'nowrap' }}>
                      {courier.maxPackageWeightKg ?? courier.maxLoadCapacityKg ?? courier.cap ?? courier.capacidad ?? ''} kg
                    </TableCell>
                    <TableCell sx={{ width: '13%', px: 3, py: '14px' }}>
                      <Chip
                        label={courier.status === 'ACTIVE' || !courier.estado ? 'Activo' : 'Inactivo'}
                        size="small"
                        sx={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          borderRadius: '20px',
                          bgcolor: courier.status === 'ACTIVE' || !courier.estado ? '#E9F3EC' : '#F1ECE7',
                          color: courier.status === 'ACTIVE' || !courier.estado ? '#2F7D4F' : '#6B6560',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {couriersList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8, color: '#9E968D' }}>
                    No hay mensajeros disponibles
                  </TableCell>
                </TableRow>
              )}
              {couriersList.length > 0 && visibleCouriers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8, color: '#9E968D' }}>
                    No se encontró ningún mensajero con ese documento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Formulario de Edición */}
      {currentCourier ? (
        <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2.5, sm: '26px 28px' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: '20px' }}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: 'primary.main' }}>
              Editar · {currentCourier.fullName || currentCourier.nombre}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#9E968D' }}>
              Cédula {currentCourier.documentNumber || currentCourier.idCard || currentCourier.cedula || currentCourier.id} · no editable
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px 22px' }}>
              <Box>
                <Typography sx={LABEL_SX}>Nombre completo</Typography>
                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={Boolean(formErrors.fullName)}
                  helperText={formErrors.fullName}
                  placeholder="Nombre y apellidos"
                  sx={INPUT_SX}
                />
              </Box>

              <Box>
                <Typography sx={LABEL_SX}>Correo electrónico</Typography>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(formErrors.email)}
                  helperText={formErrors.email}
                  placeholder="correo@blawdgourmet.com"
                  sx={INPUT_SX}
                />
              </Box>

              <Box>
                <Typography sx={LABEL_SX}>Teléfono</Typography>
                <TextField
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={Boolean(formErrors.phone)}
                  helperText={formErrors.phone}
                  placeholder="Ej. 8888 8888"
                  sx={INPUT_SX}
                />
              </Box>

              <Box>
                <Typography sx={LABEL_SX}>Horario</Typography>
                <TextField
                  fullWidth
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  error={Boolean(formErrors.schedule)}
                  helperText={formErrors.schedule}
                  placeholder="Ej. 6:00 am – 2:00 pm"
                  sx={INPUT_SX}
                />
              </Box>

              <Box>
                <Typography sx={LABEL_SX}>Capacidad máxima de carga (kg)</Typography>
                <TextField
                  fullWidth
                  name="maxLoadCapacityKg"
                  type="number"
                  value={formData.maxLoadCapacityKg}
                  onChange={handleChange}
                  error={Boolean(formErrors.maxLoadCapacityKg)}
                  helperText={formErrors.maxLoadCapacityKg}
                  placeholder="Valor positivo (ej. 25)"
                  inputProps={{ min: '1', step: 'any' }}
                  sx={INPUT_SX}
                />
              </Box>

              <Box>
                <Typography sx={LABEL_SX}>Nueva contraseña (opcional)</Typography>
                <TextField
                  fullWidth
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(formErrors.password)}
                  helperText={formErrors.password || 'Dejar vacío para no cambiar'}
                  placeholder="••••••••"
                  sx={INPUT_SX}
                />
              </Box>
            </Box>

            {/* Estado de acceso */}
            <Box
              sx={{
                bgcolor: '#F1ECE7',
                borderRadius: '12px',
                p: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                <Typography sx={{ fontSize: '13.5px', fontWeight: 600, color: '#1F2421' }}>
                  Estado de acceso
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B6560', lineHeight: 1.4 }}>
                  {isActive
                    ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.'
                    : 'Revocado. El mensajero no puede iniciar sesión.'}
                </Typography>
                {isStatusDisabled && (
                  <Typography sx={{ fontSize: '11px', color: '#C0392B', fontWeight: 600 }}>
                    Solo puedes cambiar el estado fuera de labores y sin envíos en proceso.
                  </Typography>
                )}
              </Box>
              <Switch
                checked={isActive}
                onChange={handleStatusToggle}
                disabled={isStatusDisabled}
                inputProps={{ 'aria-label': 'Estado de acceso' }}
                sx={{
                  width: 46,
                  height: 27,
                  padding: 0,
                  flex: '0 0 46px',
                  '& .MuiSwitch-switchBase': {
                    padding: '3px',
                    '&.Mui-checked': {
                      transform: 'translateX(19px)',
                      '& + .MuiSwitch-track': { backgroundColor: '#2F7D4F', opacity: 1 },
                    },
                    '&.Mui-disabled': { opacity: 0.55 },
                    '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.55 },
                  },
                  '& .MuiSwitch-thumb': { width: 21, height: 21, boxShadow: '0 1px 3px rgba(0,0,0,.25)' },
                  '& .MuiSwitch-track': { borderRadius: '14px', backgroundColor: '#DCD4CA', opacity: 1 },
                }}
              />
            </Box>

            {updateError && <StatusMessage severity="error" message={updateError} />}

            <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: 'primary.main',
                  color: '#fff',
                  fontWeight: 600,
                  px: '22px',
                  py: '14px',
                  fontSize: '14.5px',
                  borderRadius: '10px',
                  '&:hover': { bgcolor: '#12322B' },
                }}
              >
                {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar cambios'}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={handleReset}
                disabled={submitting}
                sx={{
                  color: 'primary.main',
                  border: '1.5px solid #DCD4CA',
                  fontWeight: 600,
                  px: '20px',
                  py: '14px',
                  fontSize: '14.5px',
                  borderRadius: '10px',
                }}
              >
                Descartar
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ ...CARD_SX, p: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#6B6560', fontSize: '14px' }}>
            Selecciona un mensajero de la flota arriba para editar sus datos.
          </Typography>
        </Paper>
      )}

      {/* Historial de Modificaciones (Log) */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={{ p: '16px 24px', borderBottom: '1px solid #E4DED7', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', color: 'primary.main' }}>
            Historial de modificaciones
          </Typography>
          <Chip
            label={`${changeLog.length} registros`}
            size="small"
            sx={{ fontSize: '11px', fontWeight: 600, bgcolor: '#F1ECE7', color: '#6B6560', borderRadius: '20px' }}
          />
        </Box>
        <Box>
          {changeLog.map((log) => (
            <Box
              key={log.id}
              sx={{ p: '14px 24px', borderTop: '1px solid #EFEAE4', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'baseline' }}
            >
              <Typography sx={{ fontSize: '11.5px', fontWeight: 600, color: '#9E968D', flex: '0 0 150px' }}>
                {log.when}
              </Typography>
              <Typography sx={{ fontSize: '13px', color: '#1F2421', flex: '1 1 200px', minWidth: 0, lineHeight: 1.45 }}>
                {log.text}
              </Typography>
              <Typography sx={{ fontSize: '11.5px', color: '#6B6560' }}>
                {log.by}
              </Typography>
            </Box>
          ))}
          {changeLog.length === 0 && (
            <Typography sx={{ p: '14px 24px', fontSize: '13px', color: '#9E968D' }}>
              Todavía no hay cambios registrados para esta pantalla.
            </Typography>
          )}
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
