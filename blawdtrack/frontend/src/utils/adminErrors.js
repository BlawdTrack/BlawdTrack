// Normalizes a failed POST /api/v1/admins call (axios error) into the same
// uniform model as courierErrors.js (see ./apiErrors for the shared
// status-code -> "kind" mapping). Unlike couriers, AdminUniquenessValidator
// on the backend returns a distinct `code` per duplicate (DOCUMENTO_DUPLICADO,
// DUPLICATE_EMAIL), so the 409 mapping here is a direct lookup instead of
// text-matching the message.
// UI texts are in Spanish; identifiers and comments in English.

import { normalizeApiError, extractFieldsFromApiError } from './apiErrors';

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
  contrasenaInicial: 'La contraseña debe tener al menos 8 caracteres, combinando letras y números.',
};

// Maps a 400 body's field names (Spanish, per AdminRegistrationRequest) to
// this form's inputs.
function mapValidation(data) {
  const { names, backendMessages } = extractFieldsFromApiError(data);
  const fieldErrors = {};
  let globalMessage = null;

  names.forEach((name) => {
    if (FIELD_MESSAGES[name]) {
      fieldErrors[name] = FIELD_MESSAGES[name];
    } else if (!globalMessage) {
      globalMessage = backendMessages[name] || MESSAGES.validationGeneric;
    }
  });

  if (names.length === 0) {
    globalMessage = MESSAGES.validationGeneric;
  }

  return { fieldErrors, globalMessage };
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
