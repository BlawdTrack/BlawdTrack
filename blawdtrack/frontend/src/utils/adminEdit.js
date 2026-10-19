// Reglas de la pantalla "Actualizar administrador" (HU-007) que no dependen de React: cómo se arma el formulario con
// los datos actuales, qué cambió, qué se envía al backend y qué es válido. Es el equivalente de `courierEdit.js`.
import { MIN_PASSWORD_LENGTH, meetsClientPasswordRules } from './passwordRules';
export { isFormDirty } from './forms';

/** Formulario vacío (sin administrador seleccionado). */
export const EMPTY_ADMIN_FORM = {
  fullName: '',
  email: '',
  password: '',
  status: 'ACTIVE',
};

/** Nombre del administrador, venga de la lista (`name`) o del perfil (`fullName`). */
export const getAdminName = (admin) => admin?.fullName || admin?.name || '';

/** Documento del administrador tal como se muestra. */
export const getAdminDocument = (admin) => admin?.documentNumber || admin?.identification || '';

/** `true` si la cuenta está activa; sin estado conocido se asume activa. */
export const isAdminActive = (admin) => (admin?.status ?? 'ACTIVE') === 'ACTIVE';

/** Valores iniciales del formulario a partir de un administrador de la API. La contraseña siempre parte vacía. */
export function adminToFormValues(admin) {
  return {
    fullName: getAdminName(admin),
    email: admin?.email || '',
    password: '',
    status: admin?.status || 'ACTIVE',
  };
}

/**
 * Los cambios que hay que enviar al backend: solo los campos que difieren de lo cargado. La contraseña se envía si se
 * escribió una. Cambiar el estado o la contraseña cierra la sesión del administrador.
 * @returns {{ changes: object, hasChanges: boolean, closesSession: boolean }}
 */
export function diffAdminForm(formData, initialValues) {
  const changes = {};
  const fullName = formData.fullName.trim();
  const email = formData.email.trim();

  if (fullName !== initialValues.fullName) changes.fullName = fullName;
  if (email.toLowerCase() !== initialValues.email.toLowerCase()) changes.email = email;
  if (formData.password) changes.password = formData.password;
  if (formData.status !== initialValues.status) changes.status = formData.status;

  return {
    changes,
    hasChanges: Object.keys(changes).length > 0,
    closesSession: 'status' in changes || 'password' in changes,
  };
}

/** Errores de validación del formulario por campo (objeto vacío si todo está bien). */
export function validateAdminEditForm(formData) {
  const errors = {};

  if (!formData.fullName.trim()) {
    errors.fullName = 'El nombre completo es requerido.';
  } else if (formData.fullName.trim().length > 120) {
    errors.fullName = 'El nombre no puede pasar de 120 caracteres.';
  }

  if (!formData.email.trim()) {
    errors.email = 'El correo es requerido.';
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
    errors.email = 'Ingresa un correo válido.';
  }

  if (formData.password && !meetsClientPasswordRules(formData.password)) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres y combinar letras y números.`;
  }

  return errors;
}
