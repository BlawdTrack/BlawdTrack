// Normalizes a failed POST /api/v1/admins call (axios error) into the same
// uniform model as courierErrors.js (see ./apiErrors for the shared
// status-code -> "kind" mapping). Unlike couriers, AdminUniquenessValidator
// on the backend returns a distinct `code` per duplicate (DOCUMENTO_DUPLICADO,
// DUPLICATE_EMAIL), so the 409 mapping here is a direct lookup instead of
// text-matching the message.
// UI texts are in Spanish; identifiers and comments in English.

import { apiErrorResult, extractFieldsFromApiError, normalizeApiError, mapFieldErrors } from './apiErrors';

const MESSAGES = {
  validationGeneric: 'Revisa los datos ingresados e intenta de nuevo.',
  documentDuplicate: 'Este documento ya está registrado.',
  emailDuplicate: 'Este correo electrónico ya está registrado.',
  conflictGeneric: 'Los datos del administrador entran en conflicto con un registro existente.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  forbidden: 'No tienes permisos para registrar administradores. Solo el Súper Usuario puede hacerlo.',
  server: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo en unos minutos.',
  network: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  fallback: 'No se pudo registrar el administrador. Intenta de nuevo.',
};

// The backend does not say which rule failed beyond the field name, so each
// field gets one message that covers both "blank" and "invalid".
const FIELD_MESSAGES = {
  documentType: 'Selecciona un tipo de documento.',
  documentNumber: 'Ingresa un número de documento válido para el tipo seleccionado.',
  nombreCompleto: 'Ingresa el nombre completo.',
  correoElectronico: 'Ingresa un correo electrónico válido.',
  numeroTelefono: 'El teléfono no es válido (máximo 20 caracteres).',
};

// Maps a 400 body's field names (Spanish, per AdminRegistrationRequest) to
// this form's inputs.
function mapValidation(data) {
  const { names, fieldErrors, globalMessage } = mapFieldErrors(data, FIELD_MESSAGES, MESSAGES.validationGeneric);
  return { fieldErrors, globalMessage: names.length === 0 ? MESSAGES.validationGeneric : globalMessage };
}

// AdminUniquenessValidator (backend) sets a distinct code per duplicate.
const CONFLICT_FIELD_BY_CODE = {
  DOCUMENTO_DUPLICADO: { field: 'documentNumber', message: MESSAGES.documentDuplicate },
  DUPLICATE_EMAIL: { field: 'correoElectronico', message: MESSAGES.emailDuplicate },
};

function mapConflict(data) {
  const match = CONFLICT_FIELD_BY_CODE[data?.code];
  if (match) {
    return { fieldErrors: { [match.field]: match.message } };
  }
  return { globalMessage: MESSAGES.conflictGeneric };
}

export function normalizeAdminError(error) {
  return normalizeApiError(error, { messages: MESSAGES, mapValidation, mapConflict });
}

export default normalizeAdminError;

// --- Actualización de un administrador (HU-007) -----------------------------------------------------------------

const UPDATE_MESSAGES = {
  validationGeneric: 'Revisa los datos ingresados e intenta de nuevo.',
  notFound: 'Administrador no existente. Puede que ya se haya eliminado: la lista se actualizó.',
  emailDuplicate: 'Este correo electrónico ya está registrado.',
  conflictGeneric: 'Los datos del administrador entran en conflicto con un registro existente.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  forbidden: 'No tienes permisos para modificar administradores. Solo el Súper Usuario puede hacerlo.',
  server: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo en unos minutos.',
  network: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  fallback: 'No se pudo actualizar el administrador. Intenta de nuevo.',
};

// El cuerpo del PATCH usa los nombres en inglés de `AdminUpdateRequest`.
const UPDATE_FIELD_MESSAGES = {
  fullName: 'Ingresa el nombre completo (máximo 120 caracteres).',
  email: 'Ingresa un correo electrónico válido.',
  password: 'La contraseña debe tener al menos 8 caracteres y combinar letras y números.',
  status: 'Elige un estado de acceso válido.',
};

function mapUpdateValidation(data) {
  const { names } = extractFieldsFromApiError(data);
  const fieldErrors = {};
  names.forEach((name) => {
    if (UPDATE_FIELD_MESSAGES[name]) fieldErrors[name] = UPDATE_FIELD_MESSAGES[name];
  });
  const knownFields = Object.keys(fieldErrors).length > 0;
  return { fieldErrors, globalMessage: knownFields ? null : UPDATE_MESSAGES.validationGeneric };
}

function mapUpdateConflict(data) {
  if (data?.code === 'DUPLICATE_EMAIL') {
    return { fieldErrors: { email: UPDATE_MESSAGES.emailDuplicate } };
  }
  return { globalMessage: UPDATE_MESSAGES.conflictGeneric };
}

/**
 * Normaliza un `GET` o `PATCH /api/v1/admins/{documentType}/{documentNumber}` fallido. Agrega el 404 (el administrador
 * ya no existe, `kind: 'notFound'`) a los casos comunes y muestra el correo repetido en su campo.
 * @param {unknown} error Error de axios.
 * @returns {{ kind: string, fieldErrors: object, globalMessage: string|null, severity: string }}
 */
export function normalizeAdminUpdateError(error) {
  if (error?.response?.status === 404) {
    return apiErrorResult('notFound', { globalMessage: UPDATE_MESSAGES.notFound, severity: 'warning' });
  }
  return normalizeApiError(error, {
    messages: UPDATE_MESSAGES,
    mapValidation: mapUpdateValidation,
    mapConflict: mapUpdateConflict,
  });
}
