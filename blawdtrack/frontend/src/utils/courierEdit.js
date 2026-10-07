// Reglas de la pantalla "Actualizar mensajero" que no dependen de React: cómo se lee un mensajero que
// devuelve la API, cómo se arma su formulario, cuándo hay cambios sin guardar y qué es válido.
import { MIN_PASSWORD_LENGTH, meetsClientPasswordRules } from './passwordRules';
import { parseSchedule } from './courierSchedule';

/** Formulario vacío (sin mensajero seleccionado). */
export const EMPTY_COURIER_FORM = {
  fullName: '',
  email: '',
  phone: '',
  schedule: '',
  scheduleStart: '',
  scheduleEnd: '',
  maxLoadCapacityKg: '',
  password: '',
  status: 'ACTIVE',
};

// Los nombres alternativos (`nombre`, `cedula`, `horario`…) son los heredados en español que aún pueden
// llegar de datos antiguos; la API actual usa los nombres en inglés.
export const getCourierName = (courier) => courier?.fullName || courier?.nombre || '';

/** Documento del mensajero tal como se muestra y se compara. */
export const getCourierDocument = (courier) =>
  courier.documentNumber || courier.idCard || courier.cedula || courier.id || courier.nationalId;

/** La API devuelve `status` ("ACTIVE"/"INACTIVE"); `estado` es el nombre heredado en español. */
export const isCourierActive = (courier) => (
  courier.status ? courier.status === 'ACTIVE' : courier.estado !== 'Inactivo'
);

/** Solo el rango de horas de un horario ("8:00 am – 1:00 pm, lunes a viernes" → "8:00 am – 1:00 pm"). */
export const getScheduleTimeRange = (schedule) => (schedule || '').split(',')[0].trim();

/** Si el mensajero está en labores o con envíos en proceso, su estado de acceso no se puede cambiar. */
export function getStatusLock(courier) {
  const inLabor = Boolean(courier?.inLabor || courier?.enLabores);
  const pendingPackages = courier?.pendingPackages || courier?.pendientes || 0;
  return { inLabor, pendingPackages, locked: inLabor || pendingPackages > 0 };
}

/** Valores iniciales del formulario a partir de un mensajero de la API. */
export function courierToFormValues(courier) {
  const schedule = courier.schedule || courier.horario || '';
  const { start: scheduleStart, end: scheduleEnd } = parseSchedule(schedule);
  return {
    fullName: getCourierName(courier),
    email: courier.email || '',
    phone: courier.phone || courier.telefono || '',
    schedule,
    scheduleStart,
    scheduleEnd,
    maxLoadCapacityKg: String(
      courier.maxPackageWeightKg ?? courier.maxLoadCapacityKg ?? courier.cap ?? courier.capacidad ?? ''
    ),
    password: '',
    status: courier.status || (courier.estado === 'Inactivo' ? 'INACTIVE' : 'ACTIVE'),
  };
}

/** Hay cambios sin guardar si algún campo difiere de los valores con que se cargó el mensajero. */
export const isFormDirty = (formData, initialValues) =>
  Boolean(initialValues)
  && Object.keys(initialValues).some((field) => String(formData[field] ?? '') !== String(initialValues[field] ?? ''));

/**
 * Qué cambió respecto a lo cargado, agrupado por lo que hay que enviar al backend: los datos
 * (`PUT /couriers/{id}`), la contraseña y el estado de acceso son tres llamadas distintas.
 */
export function diffCourierForm(formData, initialValues) {
  const dataChanged = ['fullName', 'email', 'phone', 'schedule'].some((field) => formData[field] !== initialValues[field])
    || String(formData.maxLoadCapacityKg) !== String(initialValues.maxLoadCapacityKg);
  const statusChanged = formData.status !== initialValues.status;
  const passwordChanged = Boolean(formData.password);
  return { dataChanged, statusChanged, passwordChanged, hasChanges: dataChanged || statusChanged || passwordChanged };
}

/** Errores de validación del formulario por campo (objeto vacío si todo está bien). */
export function validateCourierEditForm(formData) {
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

  const capacity = Number(formData.maxLoadCapacityKg);
  if (!formData.maxLoadCapacityKg.toString().trim() || Number.isNaN(capacity) || capacity <= 0) {
    errors.maxLoadCapacityKg = 'La capacidad máxima de carga debe ser un valor numérico positivo.';
  }

  if (formData.password && !meetsClientPasswordRules(formData.password)) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres, una mayúscula y un número.`;
  }

  return errors;
}

/** "1 registro" / "3 registros". */
export const recordsLabel = (count) => `${count} ${count === 1 ? 'registro' : 'registros'}`;
