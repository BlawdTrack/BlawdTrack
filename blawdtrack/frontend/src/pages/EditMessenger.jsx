import { useState, useEffect, useCallback, useRef } from 'react';
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
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import { useCourier } from '../hooks/useCourier';
import { listCouriers, updateCourierStatus, updateCourierPassword, getCourierHistory } from '../services/CourierService';
import { formatHistoryEntry } from '../utils/courierHistory';
import { MIN_PASSWORD_LENGTH, meetsClientPasswordRules } from '../utils/passwordRules';
import { getInitials } from '../utils/getInitials';
import { composeSchedule, parseSchedule } from '../utils/courierSchedule';
import { TimeWheelField } from '../components/TimeWheelField';
import { WeightWheelField } from '../components/WeightWheelField';
import Toast from '../components/Toast';
import PageHeaderBar from '../components/PageHeaderBar';
import { LABEL_SX, INPUT_SX } from '../components/formStyles';
import PageContainer from '../components/PageContainer';
import ConfirmLeaveDialog from '../components/ConfirmLeaveDialog';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import StatusMessage from '../components/StatusMessage';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import './EditMessenger.css';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_PLACEHOLDERS } from '../config/documentTypes';

const normalizeDocument = (value) => (value || '').toString().replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// Muestra solo el rango de horas en la tabla; el detalle de dias queda en el
// formulario de edicion, no en esta columna.
// La API devuelve `status` ("ACTIVE"/"INACTIVE"); `estado` es el nombre heredado en español.
const isCourierActive = (courier) => (
  courier.status ? courier.status === 'ACTIVE' : courier.estado !== 'Inactivo'
);

const getScheduleTimeRange =(schedule) => (schedule || '').split(',')[0].trim();

const CARD_SX = {
  borderRadius: '18px',
  border: '1px solid #E4DED7',
  bgcolor: '#fff',
  boxShadow: '0 12px 30px rgba(26,60,52,.06)',
};

/**
 * Pantalla "Actualizar mensajero" (HU-004), exclusiva del Super Usuario. Busca al mensajero por tipo y
 * número de documento, permite editar nombre, correo, teléfono, horario y capacidad de carga
 * (`PUT /api/v1/couriers/{id}`) y muestra el estado de acceso y el historial de cambios.
 * @param {{ initialCedula?: string }} props Documento con el que se abre la pantalla ya cargada.
 */
export function EditMessenger({ initialCedula = '' }) {
  const { loading: submitting, updateCourier } = useCourier();

  const [couriersList, setCouriersList] = useState([]);
  const [currentCourier, setCurrentCourier] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(true);
  const [activeTab, setActiveTab] = useState('datos');
  // La flota se puede ocultar para darle todo el ancho al formulario (solo escritorio).
  const [listOpen, setListOpen] = useState(true);
  // Acción pendiente mientras se pide confirmar que se descartan los cambios sin guardar.
  const [pendingLeave, setPendingLeave] = useState(null);

  const [searchDocumentType, setSearchDocumentType] = useState('CEDULA');
  const [searchDocumentNumber, setSearchDocumentNumber] = useState('');
  const [appliedFilter, setAppliedFilter] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    schedule: '',
    scheduleStart: '',
    scheduleEnd: '',
    maxLoadCapacityKg: '',
    password: '',
    status: 'ACTIVE'
  });

  const [formErrors, setFormErrors] = useState({});
  const [initialFormValues, setInitialFormValues] = useState(null);

  // Toast & Notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [updateError, setUpdateError] = useState(null);

  // Historial de modificaciones (Log) — viene de GET /v1/couriers/{id}/history
  const [changeLog, setChangeLog] = useState([]);

  const loadHistory = useCallback(async (courierId) => {
    try {
      const entries = await getCourierHistory(courierId);
      setChangeLog(Array.isArray(entries) ? entries.map(formatHistoryEntry) : []);
    } catch (err) {
      console.error('Error al cargar el historial del mensajero:', err);
      setChangeLog([]);
    }
  }, []);

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
    const schedule = courier.schedule || courier.horario || '';
    const { start: scheduleStart, end: scheduleEnd } = parseSchedule(schedule);
    const initialVals = {
      fullName: courier.fullName || courier.nombre || '',
      email: courier.email || '',
      phone: courier.phone || courier.telefono || '',
      schedule,
      scheduleStart,
      scheduleEnd,
      maxLoadCapacityKg: String(courier.maxPackageWeightKg ?? courier.maxLoadCapacityKg ?? courier.cap ?? courier.capacidad ?? ''),
      password: '',
      status: courier.status || (courier.estado === 'Inactivo' ? 'INACTIVE' : 'ACTIVE')
    };
    setFormData(initialVals);
    setInitialFormValues(initialVals);
    setActiveTab('datos');
    setFormErrors({});
    setUpdateError(null);
    loadHistory(courier.id);
  };

  // Vuelve a "Elige un mensajero": sin selección, sin formulario y con la flota a la vista.
  const clearSelection = () => {
    setCurrentCourier(null);
    setSelectedCourierId(null);
    setInitialFormValues(null);
    setFormErrors({});
    setUpdateError(null);
    setChangeLog([]);
    setActiveTab('datos');
    setListOpen(true);
  };

  // Hay cambios sin guardar si algún campo del formulario difiere del mensajero tal como se cargó.
  const isDirty = Boolean(
    currentCourier
    && initialFormValues
    && Object.keys(initialFormValues).some((field) => String(formData[field] ?? '') !== String(initialFormValues[field] ?? ''))
  );

  // Ejecuta `action` de inmediato o, si hay cambios sin guardar, tras confirmar que se descartan.
  const runOrConfirmLeave = (action) => {
    if (isDirty) {
      setPendingLeave(() => action);
      return;
    }
    action();
  };

  // En móvil el detalle reemplaza a la lista; esto vuelve a ella.
  const handleBackToList = () => runOrConfirmLeave(clearSelection);

  const handleRowClick = (courier) => {
    if (courier.id === currentCourier?.id) return;
    runOrConfirmLeave(() => loadMessengerData(courier));
  };

  const handleConfirmLeave = () => {
    const action = pendingLeave;
    setPendingLeave(null);
    action?.();
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

  // Cargar por cédula inicial si se proporciona (una sola vez: tras guardar se vuelve a "Elige un mensajero").
  const initialLoadedRef = useRef(false);
  useEffect(() => {
    if (initialCedula && couriersList.length > 0 && !initialLoadedRef.current) {
      const normInitial = normalizeId(initialCedula);
      const found = couriersList.find((m) =>
        normalizeId(getCourierId(m)) === normInitial
      );
      if (found) {
        initialLoadedRef.current = true;
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

  // Las ruedas de entrada y salida componen el texto de horario que se envía al backend.
  const handleScheduleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      return { ...next, schedule: composeSchedule(next.scheduleStart, next.scheduleEnd) };
    });
    if (formErrors.schedule) {
      setFormErrors((prev) => ({ ...prev, schedule: null }));
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
    } else if (formData.scheduleStart && formData.scheduleEnd && formData.scheduleEnd <= formData.scheduleStart) {
      errors.schedule = 'La hora de salida debe ser posterior a la de entrada.';
    }

    const capNum = Number(formData.maxLoadCapacityKg);
    if (!formData.maxLoadCapacityKg.toString().trim() || isNaN(capNum) || capNum <= 0) {
      errors.maxLoadCapacityKg = 'La capacidad máxima de carga debe ser un valor numérico positivo.';
    }

    if (formData.password && !meetsClientPasswordRules(formData.password)) {
      errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres, una mayúscula y un número.`;
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

    // El backend resuelve el mensajero por su id de perfil; un documento de solo dígitos se confundiría con un id.
    const idCard = currentCourier.id;

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

    const dataChanged = ['fullName', 'email', 'phone', 'schedule'].some(
      (field) => formData[field] !== initialFormValues[field]
    ) || String(formData.maxLoadCapacityKg) !== String(initialFormValues.maxLoadCapacityKg);
    const statusChanged = formData.status !== initialFormValues.status;
    const passwordChanged = Boolean(formData.password);

    // Pasos que el backend ya guardó (y registró en el historial) aunque un paso posterior falle.
    let dataSaved = false;
    let passwordSaved = false;

    try {
      if (dataChanged) {
        await updateCourier(idCard, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          schedule: formData.schedule,
          maxPackageWeightKg: Number(formData.maxLoadCapacityKg)
        });
        dataSaved = true;
      }

      // El backend guarda la contraseña cifrada, cierra la sesión del mensajero y la registra en el historial.
      if (passwordChanged) {
        await updateCourierPassword(currentCourier.id, formData.password);
        passwordSaved = true;
      }

      // Criterio de aceptación 1: el backend cierra la sesión activa al cambiar el estado de acceso.
      if (statusChanged) {
        try {
          await updateCourierStatus(currentCourier.id, formData.status);
        } catch (statusError) {
          // El backend rechazó el cambio (p. ej. envíos en proceso): el interruptor vuelve al estado real.
          setFormData((prev) => ({ ...prev, status: initialFormValues.status }));
          throw statusError;
        }
      }

      // Actualizar estado local
      const updatedCourier = {
        ...currentCourier,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        schedule: formData.schedule,
        maxPackageWeightKg: Number(formData.maxLoadCapacityKg),
        status: formData.status
      };
      setCurrentCourier(updatedCourier);
      // La tabla de la flota refleja de inmediato los datos y el estado guardados.
      setCouriersList((prev) => prev.map((courier) => (
        courier.id === updatedCourier.id ? { ...courier, ...updatedCourier } : courier
      )));

      // Criterio de aceptación 3: el historial (fecha, hora y campos) lo registra el backend y se ve al
      // volver a abrir al mensajero. Guardado el cambio, se regresa a "Elige un mensajero".
      clearSelection();

      setToast({
        open: true,
        message: 'Notificación de actualización exitosa. Los datos del mensajero han sido modificados.',
        severity: 'success'
      });
    } catch (err) {
      // Si un paso anterior ya quedó guardado, la pantalla y el historial deben reflejarlo igualmente:
      // el historial se recarga y no se vuelve a enviar lo ya guardado (p. ej. la contraseña).
      if (dataSaved || passwordSaved) {
        loadHistory(currentCourier.id);
        loadCouriersList();
        if (passwordSaved) {
          setFormData((prev) => ({ ...prev, password: '' }));
        }
        if (dataSaved) {
          const savedData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            schedule: formData.schedule,
            scheduleStart: formData.scheduleStart,
            scheduleEnd: formData.scheduleEnd,
            maxLoadCapacityKg: formData.maxLoadCapacityKg
          };
          setInitialFormValues((prev) => ({ ...prev, ...savedData }));
          setCurrentCourier((prev) => ({
            ...prev,
            fullName: savedData.fullName,
            email: savedData.email,
            phone: savedData.phone,
            schedule: savedData.schedule,
            maxPackageWeightKg: Number(savedData.maxLoadCapacityKg)
          }));
        }
      }
      const errorMessage = err.response?.data?.message || err.message || 'Error al actualizar la información del mensajero.';
      setUpdateError(errorMessage);
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // "Descartar": abandona la edición y vuelve de una vez a "Elige un mensajero", sin guardar nada.
  const handleDiscard = clearSelection;

  const inLabor = currentCourier?.inLabor || currentCourier?.enLabores || false;
  const pendingPackages = currentCourier?.pendingPackages || currentCourier?.pendientes || 0;
  const isStatusDisabled = inLabor || pendingPackages > 0;
  const isActive = formData.status === 'ACTIVE';

  const activeStatusChip = (active) => (
    <Chip
      label={active ? 'Activo' : 'Inactivo'}
      size="small"
      sx={{
        fontSize: 12,
        fontWeight: 700,
        borderRadius: '20px',
        bgcolor: active ? '#E9F3EC' : '#F1ECE7',
        color: active ? '#2F7D4F' : '#6B6560',
      }}
    />
  );

  const courierName = currentCourier?.fullName || currentCourier?.nombre || '';
  const courierDocument = currentCourier
    ? currentCourier.documentNumber || currentCourier.idCard || currentCourier.cedula || currentCourier.id
    : '';

  // Una sola vista a la altura de la pantalla en escritorio: la lista a la izquierda y el mensajero
  // seleccionado a la derecha, con el historial en una pestaña. En móvil se muestra la lista o el detalle.
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { md: '100vh' }, minHeight: 0 }}>
      <PageHeaderBar
        title="Actualizar mensajero"
        description="Busca al mensajero por su documento, corrige sus datos y guarda los cambios."
      />

      <PageContainer wide sx={{ flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: listOpen ? '420px minmax(0, 1fr)' : 'minmax(0, 1fr)' },
            gridTemplateRows: { md: 'minmax(0, 1fr)' },
          }}
        >
          {/* LISTA: búsqueda + flota */}
          <Paper
            elevation={0}
            sx={{
              ...CARD_SX,
              overflow: 'hidden',
              display: { xs: currentCourier ? 'none' : 'flex', md: listOpen ? 'flex' : 'none' },
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid #E4DED7', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
                  Buscar mensajero por documento
                </Typography>
                {currentCourier && (
                  <Tooltip title="Ocultar la flota de mensajeros">
                    <IconButton
                      onClick={() => setListOpen(false)}
                      aria-label="Ocultar la flota de mensajeros"
                      size="small"
                      sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'primary.main' }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  select
                  value={searchDocumentType}
                  onChange={(e) => setSearchDocumentType(e.target.value)}
                  slotProps={{ htmlInput: { 'aria-label': 'Tipo de documento' } }}
                  sx={{ flex: '0 0 120px', ...INPUT_SX }}
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
                  slotProps={{ htmlInput: { 'aria-label': 'Número de documento' } }}
                  sx={{ flex: '1 1 auto', minWidth: 0, ...INPUT_SX }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  disableElevation
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  sx={{ flex: 1, minHeight: 44, fontWeight: 600, borderRadius: '10px' }}
                >
                  Buscar
                </Button>
                {appliedFilter && (
                  <Button onClick={handleClearSearch} sx={{ color: '#6B6560', fontWeight: 600 }}>
                    Limpiar
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
                Flota de mensajeros
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#6B6560' }}>
                {visibleCouriers.length} {visibleCouriers.length === 1 ? 'mensajero' : 'mensajeros'}
              </Typography>
            </Box>

            <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
              <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
                <TableHead>
                  <TableRow>
                    {['Mensajero', 'Estado'].map((heading) => (
                      <TableCell
                        key={heading}
                        sx={{ width: heading === 'Estado' ? 104 : 'auto', bgcolor: '#F1ECE7', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: '#6B6560', letterSpacing: '.9px', border: 0, py: 1, px: 2.5 }}
                      >
                        {heading}
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
                        hover
                        selected={isSelected}
                        sx={{ cursor: 'pointer', '& td': { borderColor: '#EFEAE4' }, '&.Mui-selected': { bgcolor: '#F7F3EE' } }}
                        onClick={() => handleRowClick(courier)}
                      >
                        <TableCell sx={{ px: 2.5, py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                            <Avatar sx={{ width: 36, height: 36, flex: '0 0 36px', bgcolor: isSelected ? 'primary.main' : '#F1ECE7', color: isSelected ? '#fff' : '#6B6560', fontWeight: 700, fontSize: 12 }}>
                              {getInitials(courier.fullName || courier.nombre)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 600, color: '#1F2421', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {courier.fullName || courier.nombre}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#6B6560', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {courier.documentNumber || courier.idCard || courier.cedula || courier.id || ''}
                                {' · '}
                                {getScheduleTimeRange(courier.schedule || courier.horario)}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ px: 2.5, py: 1.5, width: 104 }}>{activeStatusChip(isCourierActive(courier))}</TableCell>
                      </TableRow>
                    );
                  })}
                  {isLoadingCouriers && couriersList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress size={28} />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoadingCouriers && couriersList.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 6, color: '#6B6560' }}>
                        No hay mensajeros disponibles
                      </TableCell>
                    </TableRow>
                  )}
                  {couriersList.length > 0 && visibleCouriers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 6, color: '#6B6560' }}>
                        No se encontró ningún mensajero con ese documento.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* DETALLE: datos editables e historial */}
          {currentCourier ? (
            <Paper
              elevation={0}
              sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}
            >
              <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
                <Button
                  onClick={handleBackToList}
                  startIcon={<ArrowBackIcon />}
                  sx={{ display: { xs: 'flex', md: 'none' }, flex: '0 0 100%', justifyContent: 'flex-start', color: 'primary.main', fontWeight: 600, ml: -1 }}
                >
                  Volver a la lista
                </Button>
                {!listOpen && (
                  <Button
                    onClick={() => setListOpen(true)}
                    startIcon={<ViewSidebarOutlinedIcon />}
                    sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'primary.main', fontWeight: 600, border: '1.5px solid #DCD4CA' }}
                  >
                    Mostrar flota
                  </Button>
                )}
                <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', color: '#fff', fontWeight: 700 }}>
                  {getInitials(courierName)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>
                    Editar · {courierName}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
                    Cédula {courierDocument} · no editable
                  </Typography>
                </Box>
                {activeStatusChip(isActive)}
              </Box>

              <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
                sx={{ px: 1.5, borderBottom: '1px solid #E4DED7', minHeight: 48 }}
              >
                <Tab value="datos" label="Datos" id="tab-datos" aria-controls="panel-datos" />
                <Tab value="historial" label={`Historial (${changeLog.length})`} id="tab-historial" aria-controls="panel-historial" />
              </Tabs>

              <Box
                component="form"
                onSubmit={handleSubmit}
                role="tabpanel"
                id="panel-datos"
                aria-labelledby="tab-datos"
                hidden={activeTab !== 'datos'}
                sx={{ display: activeTab === 'datos' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}
              >
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: { xs: 2, md: '20px 24px' }, alignItems: 'start' }}>
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimeWheelField
                          id="scheduleStart"
                          label="Hora de entrada"
                          value={formData.scheduleStart}
                          error={Boolean(formErrors.schedule)}
                          onChange={(v) => handleScheduleChange('scheduleStart', v)}
                        />
                        <Typography component="span" sx={{ color: '#6B6560' }}>a</Typography>
                        <TimeWheelField
                          id="scheduleEnd"
                          label="Hora de salida"
                          value={formData.scheduleEnd}
                          error={Boolean(formErrors.schedule)}
                          onChange={(v) => handleScheduleChange('scheduleEnd', v)}
                        />
                      </Box>
                      {formData.schedule && !formData.scheduleStart && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, mx: 1.75, color: '#6B6560' }}>
                          Horario actual: {formData.schedule}. Elige las horas para cambiarlo.
                        </Typography>
                      )}
                      {formErrors.schedule && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mx: 1.75 }}>
                          {formErrors.schedule}
                        </Typography>
                      )}
                    </Box>

                    <Box>
                      <Typography sx={LABEL_SX}>Capacidad máxima de carga (kg)</Typography>
                      <WeightWheelField
                        id="maxLoadCapacityKg"
                        label="Capacidad máxima de carga"
                        value={formData.maxLoadCapacityKg}
                        error={Boolean(formErrors.maxLoadCapacityKg)}
                        onChange={(v) => handleChange({ target: { name: 'maxLoadCapacityKg', value: v } })}
                      />
                      {formErrors.maxLoadCapacityKg && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mx: 1.75 }}>
                          {formErrors.maxLoadCapacityKg}
                        </Typography>
                      )}
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
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#1F2421' }}>
                        Estado de acceso
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#6B6560', lineHeight: 1.4 }}>
                        {isActive
                          ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.'
                          : 'Revocado. El mensajero no puede iniciar sesión.'}
                      </Typography>
                      {isStatusDisabled && (
                        <Typography sx={{ fontSize: 14, color: '#C0392B', fontWeight: 600 }}>
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
                </Box>

                {/* Los botones quedan siempre a la vista, sin necesidad de bajar. */}
                <Box sx={{ px: 3, py: 2, borderTop: '1px solid #E4DED7', bgcolor: '#fff', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{ fontWeight: 600, px: 4, minHeight: 48, fontSize: 16, borderRadius: '10px' }}
                  >
                    {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar cambios'}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleDiscard}
                    disabled={submitting}
                    sx={{ color: 'primary.main', border: '1.5px solid #DCD4CA', fontWeight: 600, px: 3, minHeight: 48, fontSize: 16, borderRadius: '10px' }}
                  >
                    Descartar
                  </Button>
                </Box>
              </Box>

              {/* Historial de Modificaciones (Log) */}
              <Box
                role="tabpanel"
                id="panel-historial"
                aria-labelledby="tab-historial"
                hidden={activeTab !== 'historial'}
                sx={{ display: activeTab === 'historial' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0 }}
              >
                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
                    Historial de modificaciones
                  </Typography>
                  <Chip
                    label={`${changeLog.length} registros`}
                    size="small"
                    sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#F1ECE7', color: '#6B6560', borderRadius: '20px' }}
                  />
                </Box>
                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
                  {changeLog.map((log) => (
                    <Box
                      key={log.id}
                      sx={{ px: 3, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'baseline' }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6560', flex: '0 0 150px' }}>
                        {log.when}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: '#1F2421', flex: '1 1 200px', minWidth: 0, lineHeight: 1.45 }}>
                        {log.text}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#6B6560' }}>
                        {log.by}
                      </Typography>
                    </Box>
                  ))}
                  {changeLog.length === 0 && (
                    <Typography sx={{ px: 3, py: 2, fontSize: 14, color: '#6B6560' }}>
                      Todavía no hay cambios registrados para esta pantalla.
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                ...CARD_SX,
                p: 4,
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                textAlign: 'center',
              }}
            >
              <Box sx={{ width: 72, height: 72, borderRadius: '18px', bgcolor: '#FFE8D9', color: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PersonSearchOutlinedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>
                Elige un mensajero
              </Typography>
              <Typography sx={{ color: '#6B6560', fontSize: 16, maxWidth: 360 }}>
                Selecciona un mensajero de la lista para editar sus datos y ver su historial.
              </Typography>
            </Paper>
          )}
        </Box>
      </PageContainer>

      <UnsavedChangesGuard when={isDirty} />
      <ConfirmLeaveDialog open={Boolean(pendingLeave)} onStay={() => setPendingLeave(null)} onLeave={handleConfirmLeave} />

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
