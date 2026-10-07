import { useCallback, useState } from 'react';
import { useCourier } from './useCourier';
import { useCourierHistory } from './useCourierHistory';
import { updateCourierPassword, updateCourierStatus } from '../services/CourierService';
import { composeSchedule } from '../utils/courierSchedule';
import {
  EMPTY_COURIER_FORM,
  courierToFormValues,
  diffCourierForm,
  getStatusLock,
  isFormDirty,
  validateCourierEditForm,
} from '../utils/courierEdit';

const DATA_SAVED_MESSAGE = 'Notificación de actualización exitosa. Los datos del mensajero han sido modificados.';

/**
 * Edición de un mensajero (HU-004): cuál está seleccionado, su formulario, la validación y el guardado.
 * Guardar son hasta tres llamadas (datos, contraseña y estado de acceso); si una falla después de que otra
 * ya quedó guardada, se conserva lo guardado para no volver a enviarlo.
 *
 * @param {{ notify: (message: string, severity?: string) => void,
 *   onSaved: (courier: object) => void, onPartialSave: () => void }} options `notify` muestra avisos;
 *   `onSaved` se llama con el mensajero actualizado cuando todo se guardó; `onPartialSave` cuando algo
 *   quedó guardado pero otra llamada falló (para que la flota se vuelva a cargar).
 */
export function useCourierEditor({ notify, onSaved, onPartialSave }) {
  const { loading: submitting, updateCourier } = useCourier();
  const history = useCourierHistory();

  const [courier, setCourier] = useState(null);
  const [formData, setFormData] = useState(EMPTY_COURIER_FORM);
  const [initialValues, setInitialValues] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [updateError, setUpdateError] = useState(null);

  const loadHistory = history.load;

  const select = useCallback((selected) => {
    const values = courierToFormValues(selected);
    setCourier(selected);
    setFormData(values);
    setInitialValues(values);
    setFormErrors({});
    setUpdateError(null);
    loadHistory(selected.id);
  }, [loadHistory]);

  /** Deja de editar: sin mensajero, sin formulario y sin historial. */
  const clear = () => {
    setCourier(null);
    setInitialValues(null);
    setFormErrors({});
    setUpdateError(null);
    history.clear();
  };

  const change = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (formErrors[name]) setFormErrors((previous) => ({ ...previous, [name]: null }));
  };

  // Las ruedas de entrada y salida componen el texto de horario que se envía al backend.
  const changeSchedule = (field, value) => {
    setFormData((previous) => {
      const next = { ...previous, [field]: value };
      return { ...next, schedule: composeSchedule(next.scheduleStart, next.scheduleEnd) };
    });
    if (formErrors.schedule) setFormErrors((previous) => ({ ...previous, schedule: null }));
  };

  const statusLock = getStatusLock(courier);

  const toggleStatus = () => {
    if (!courier) return;

    // Criterio de aceptación 2: solo se puede cambiar fuera de labores y antes de tener envíos en proceso.
    if (statusLock.locked) {
      const reason = statusLock.inLabor
        ? 'El mensajero se encuentra actualmente en labores.'
        : `El mensajero tiene ${statusLock.pendingPackages} envío(s) en proceso.`;
      notify(
        `Cualquier cambio de estado del mensajero debe realizarse antes de que tenga envíos en proceso y únicamente cuando se encuentre fuera de sus labores. (${reason})`,
        'warning'
      );
      return;
    }

    const nextStatus = formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setFormData((previous) => ({ ...previous, status: nextStatus }));

    // Criterio de aceptación 1: cualquier cambio en el estado de acceso cierra la sesión activa de inmediato.
    if (nextStatus === 'INACTIVE') {
      notify('Cambio en el estado de acceso: La sesión activa del mensajero se cerrará de inmediato.', 'warning');
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!courier) return;

    const errors = validateCourierEditForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      notify('Por favor corrija los errores en el formulario antes de guardar.', 'error');
      return;
    }

    setUpdateError(null);

    const { dataChanged, statusChanged, passwordChanged, hasChanges } = diffCourierForm(formData, initialValues);
    if (!hasChanges) {
      notify('No se detectaron cambios en la información del mensajero.', 'warning');
      return;
    }

    // Pasos que el backend ya guardó (y registró en el historial) aunque un paso posterior falle.
    let dataSaved = false;
    let passwordSaved = false;

    try {
      if (dataChanged) {
        // El backend resuelve el mensajero por su id de perfil; un documento de solo dígitos se confundiría con un id.
        await updateCourier(courier.id, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          schedule: formData.schedule,
          maxPackageWeightKg: Number(formData.maxLoadCapacityKg),
        });
        dataSaved = true;
      }

      // El backend guarda la contraseña cifrada, cierra la sesión del mensajero y la registra en el historial.
      if (passwordChanged) {
        await updateCourierPassword(courier.id, formData.password);
        passwordSaved = true;
      }

      if (statusChanged) {
        try {
          await updateCourierStatus(courier.id, formData.status);
        } catch (statusError) {
          // El backend rechazó el cambio (p. ej. envíos en proceso): el interruptor vuelve al estado real.
          setFormData((previous) => ({ ...previous, status: initialValues.status }));
          throw statusError;
        }
      }

      onSaved({
        ...courier,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        schedule: formData.schedule,
        maxPackageWeightKg: Number(formData.maxLoadCapacityKg),
        status: formData.status,
      });
      clear();
      notify(DATA_SAVED_MESSAGE, 'success');
    } catch (err) {
      // Si un paso anterior ya quedó guardado, el historial y la flota deben reflejarlo igualmente y no se
      // vuelve a enviar lo ya guardado (p. ej. la contraseña).
      if (dataSaved || passwordSaved) {
        loadHistory(courier.id);
        onPartialSave();
        if (passwordSaved) setFormData((previous) => ({ ...previous, password: '' }));
        if (dataSaved) {
          const saved = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            schedule: formData.schedule,
            scheduleStart: formData.scheduleStart,
            scheduleEnd: formData.scheduleEnd,
            maxLoadCapacityKg: formData.maxLoadCapacityKg,
          };
          setInitialValues((previous) => ({ ...previous, ...saved }));
          setCourier((previous) => ({
            ...previous,
            fullName: saved.fullName,
            email: saved.email,
            phone: saved.phone,
            schedule: saved.schedule,
            maxPackageWeightKg: Number(saved.maxLoadCapacityKg),
          }));
        }
      }
      const message = err.response?.data?.message || err.message || 'Error al actualizar la información del mensajero.';
      setUpdateError(message);
      notify(message, 'error');
    }
  };

  return {
    courier,
    formData,
    formErrors,
    updateError,
    submitting,
    history: history.entries,
    isDirty: Boolean(courier) && isFormDirty(formData, initialValues),
    isStatusLocked: statusLock.locked,
    select,
    clear,
    change,
    changeSchedule,
    toggleStatus,
    submit,
  };
}
