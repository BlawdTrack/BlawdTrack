import { useState } from 'react';
import { useFormLeave } from './useFormLeave';
import { isFormDirty } from '../utils/forms';

/**
 * Lógica común de los formularios de creación (mensajero, administrador): valores del formulario,
 * protección de salida con datos sin guardar, validación al salir de un campo y al enviar, foco en el
 * primer error y regreso al menú del módulo con un aviso de éxito. Cada pantalla solo aporta sus
 * valores iniciales, su validación y su llamada de registro.
 * @param {{
 *   initialData: Record<string, string>,
 *   validate: (formData: object) => Record<string, string>,
 *   fieldOrder: string[],
 *   discardTo: string,
 *   registration: { isSubmitting: boolean, fieldErrors: object, register: Function, setValidationErrors: Function,
 *     setFieldError: Function, clearFieldError: Function },
 *   buildPayload: (formData: object) => object,
 *   buildNotice: (outcome: object, payload: object) => string,
 * }} options `fieldOrder` es el orden visual de los campos (el primero con error recibe el foco, y cada
 *   campo debe tener `id` igual a su nombre); `registration` es el resultado de `useCourier` o
 *   `useAdminRegistration`; `discardTo` es el menú del módulo al que se vuelve.
 */
export function useRegistrationForm({
  initialData,
  validate,
  fieldOrder,
  discardTo,
  registration,
  buildPayload,
  buildNotice,
}) {
  const [formData, setFormData] = useState(initialData);
  // Con datos escritos, salir (menú, otra pantalla, cerrar la pestaña) o descartar pide confirmación.
  const form = useFormLeave({ isDirty: isFormDirty(formData, initialData), discardTo });
  const { isSubmitting, fieldErrors, register, setValidationErrors, setFieldError, clearFieldError } = registration;

  /**
   * Cambia un campo y limpia su error. `derive` ajusta otros valores a partir del nuevo (por ejemplo, el
   * horario compuesto por la hora de entrada y la de salida); `errorKey` es el error que se limpia
   * cuando difiere del nombre del campo; `validateWhen` decide si se valida de inmediato (los selectores
   * de rueda no tienen "blur").
   */
  const setField = (name, value, { derive, errorKey = name, validateWhen } = {}) => {
    const next = derive ? derive({ ...formData, [name]: value }) : { ...formData, [name]: value };
    setFormData(next);
    clearFieldError(errorKey);
    if (validateWhen?.(next)) {
      const message = validate(next)[errorKey];
      if (message) setFieldError(errorKey, message);
    }
  };

  const handleChange = (event) => setField(event.target.name, event.target.value);

  // Valida un campo de texto al salir de él, pero solo si ya tiene contenido (un campo obligatorio vacío
  // se reporta al enviar, no mientras se recorre el formulario con el teclado).
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value.trim()) return;
    const message = validate(formData)[name];
    if (message) setFieldError(name, message);
  };

  const focusFirstError = (errors) => {
    const firstField = fieldOrder.find((name) => errors[name]);
    document.getElementById(firstField)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const clientErrors = validate(formData);
    if (Object.keys(clientErrors).length > 0) {
      setValidationErrors(clientErrors);
      focusFirstError(clientErrors);
      return;
    }

    const payload = buildPayload(formData);
    const outcome = await register(payload);
    if (outcome?.ok) {
      // Todo salió bien: se avisa en el menú del módulo, a donde se regresa de inmediato.
      form.leave(discardTo, {
        state: { notice: { severity: 'success', message: buildNotice(outcome, payload) } },
      });
    } else if (outcome) {
      focusFirstError(outcome.fieldErrors);
    }
  };

  // Props comunes de cada campo: valor, cambio, error en línea y el cableado de accesibilidad
  // (MUI enlaza el texto de ayuda con `aria-describedby`).
  const fieldProps = (name) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: Boolean(fieldErrors[name]),
    helperText: fieldErrors[name] || undefined,
  });

  return { formData, form, setField, handleSubmit, fieldProps };
}

export default useRegistrationForm;
