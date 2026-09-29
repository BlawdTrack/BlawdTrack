// Normalizes a failed POST /api/v1/couriers call (axios error) into a uniform
// model the registration form can render. The status-code -> "kind" mapping
// (network/validation/conflict/auth/server) is shared via ./apiErrors; only
// the courier-specific texts and field matching live here.
// UI texts are in Spanish; identifiers and comments in English.

import { normalizeApiError, extractFieldsFromApiError } from './apiErrors';

const MESSAGES = {
  validationGeneric: 'Revisa los datos ingresados e intenta de nuevo.',
  documentInvalid: 'Ingresa un número de documento válido para el tipo seleccionado.',
  documentDuplicate: 'Este documento ya está registrado.',
  emailDuplicate: 'Este correo electrónico ya está registrado.',
  phoneDuplicate: 'Este teléfono ya está registrado.',
  conflictGeneric: 'Los datos del mensajero entran en conflicto con un registro existente.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  forbidden: 'No tienes permisos para registrar mensajeros. Solo el Súper Usuario puede hacerlo.',
  server: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo en unos minutos.',
  network: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  fallback: 'No se pudo registrar el mensajero. Intenta de nuevo.',
};

// The backend does not say which rule failed, so each field gets one message
// that covers both "blank" and "invalid".
const FIELD_MESSAGES = {
  documentType: 'Selecciona un tipo de documento.',
  documentNumber: MESSAGES.documentInvalid,
  fullName: 'Ingresa el nombre completo.',
  email: 'Ingresa un correo electrónico válido.',
  phone: 'El teléfono no es válido (máximo 20 caracteres).',
  schedule: 'Ingresa el horario.',
  // A blank weight is sent as null and fails @NotNull; @Positive/@Digits map here too.
  maxPackageWeightKg: 'Ingresa un número positivo (hasta 8 enteros y 2 decimales).',
};

// Lowercase and strip diacritics so "Teléfono" and "telefono" compare equal.
function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function mapValidation(data) {
  const { names, backendMessages } = extractFieldsFromApiError(data);
  const fieldErrors = {};
  let globalMessage = null;

  names.forEach((name) => {
    if (FIELD_MESSAGES[name]) {
      fieldErrors[name] = FIELD_MESSAGES[name];
    } else if (!globalMessage) {
      // Field without an input in the form: show the backend text if any.
      globalMessage = backendMessages[name] || MESSAGES.validationGeneric;
    }
  });

  if (names.length === 0) {
    if (data?.code === 'VALIDATION_FAILED') {
      // Heuristic: @ValidDocument is a class-level constraint, and the courier
      // controller only lists field-level errors, so an invalid document format
      // comes back as "Revise los campos: " with an empty list. It is the only
      // class-level rule, so we attribute the failure to documentNumber.
      // To be confirmed against the real backend; remove if it does not hold.
      fieldErrors.documentNumber = MESSAGES.documentInvalid;
    } else {
      globalMessage = MESSAGES.validationGeneric;
    }
  }

  return { fieldErrors, globalMessage };
}

// TEMPORARY: the 409 body has no structured field, only a Spanish message such
// as "El correo ya está registrado". We match keywords on the normalized text
// until the backend exposes a field or a specific code per duplicate.
function mapConflict(data) {
  const text = normalizeText(data?.message);
  if (text.includes('documento')) {
    return { fieldErrors: { documentNumber: MESSAGES.documentDuplicate } };
  }
  if (text.includes('correo')) {
    return { fieldErrors: { email: MESSAGES.emailDuplicate } };
  }
  if (text.includes('telefono')) {
    return { fieldErrors: { phone: MESSAGES.phoneDuplicate } };
  }
  return { globalMessage: MESSAGES.conflictGeneric };
}

export function normalizeCourierError(error) {
  return normalizeApiError(error, { messages: MESSAGES, mapValidation, mapConflict });
}

export default normalizeCourierError;
