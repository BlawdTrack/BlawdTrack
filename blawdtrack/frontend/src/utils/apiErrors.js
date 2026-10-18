// Generic HTTP-error -> UI-error-model normalizer, shared by every
// registration/update form that talks to the REST API (couriers, admins, ...).
// A form only supplies its own texts and how to read a 409 conflict; the
// status-code -> "kind" mapping (network/validation/conflict/auth/server)
// lives here once instead of being copy-pasted per resource.
//
// Output shape: { kind, fieldErrors, globalMessage, severity }
// - fieldErrors: { [fieldName]: message } shown inline under each input.
// - globalMessage: text for an alert (null when everything maps to a field).

export const VALIDATION_CODES = ['VALIDATION_FAILED', 'VALIDATION_ERROR'];

export function apiErrorResult(kind, { fieldErrors = {}, globalMessage = null, severity = 'error' } = {}) {
  return { kind, fieldErrors, globalMessage, severity };
}

// Returns { names, backendMessages } from either the global ApiError shape
// (errores[] with campo/mensaje) or a message-only shape where the field
// names appear inside the text: "Revise los campos: a, b".
export function extractFieldsFromApiError(data) {
  if (Array.isArray(data?.errores) && data.errores.length > 0) {
    const names = [];
    const backendMessages = {};
    data.errores.forEach((item) => {
      if (!item?.campo) return;
      names.push(item.campo);
      if (item.mensaje) backendMessages[item.campo] = item.mensaje;
    });
    return { names, backendMessages };
  }

  const match = /campos:\s*(.*)$/i.exec(String(data?.message ?? ''));
  const names = match
    ? match[1].split(',').map((name) => name.trim()).filter(Boolean)
    : [];
  return { names, backendMessages: {} };
}

/**
 * Maps the field names of a 400 body to a form's inputs: the ones the form knows get their own message, the
 * first one it does not know becomes the global message (the backend text if any, else `genericMessage`).
 * @returns {{ names: string[], fieldErrors: object, globalMessage: string|null }} `names` is empty when the
 *   body names no field, so each caller decides what that means.
 */
export function mapFieldErrors(data, fieldMessages, genericMessage) {
  const { names, backendMessages } = extractFieldsFromApiError(data);
  const fieldErrors = {};
  let globalMessage = null;

  names.forEach((name) => {
    if (fieldMessages[name]) {
      fieldErrors[name] = fieldMessages[name];
    } else if (!globalMessage) {
      globalMessage = backendMessages[name] || genericMessage;
    }
  });

  return { names, fieldErrors, globalMessage };
}

/**
 * Normalizes a failed axios call into { kind, fieldErrors, globalMessage, severity }.
 *
 * @param {unknown} error - the caught axios error.
 * @param {object} config
 * @param {object} config.messages - generic texts: network, validationGeneric,
 *   unauthenticated, forbidden, server, fallback.
 * @param {(data: unknown) => { fieldErrors?: object, globalMessage?: string }} config.mapValidation
 *   Fully maps a 400 response to this form's { fieldErrors, globalMessage }
 *   (which fields it knows, and what to say about the ones it doesn't).
 * @param {(data: unknown) => { fieldErrors?: object, globalMessage?: string }} config.mapConflict
 *   Maps a 409 response to a field error (duplicate document/email/...) or a
 *   generic conflict message.
 */
export function normalizeApiError(error, config) {
  const { messages, mapValidation, mapConflict } = config;
  const response = error?.response;

  // No response: network down, backend off or request timeout.
  if (!response) {
    return apiErrorResult('network', { globalMessage: messages.network });
  }

  const { status, data } = response;

  if (status === 400 && (VALIDATION_CODES.includes(data?.code) || data?.errores)) {
    return mappedResult('validation', mapValidation, data);
  }
  if (status === 409) {
    return mappedResult('conflict', mapConflict, data);
  }
  const generic = genericErrorFor(status, messages);
  return apiErrorResult(generic.kind, generic.options);
}

// Respuestas que solo llevan un texto genérico; el resto cae en `unknown`.
function genericErrorFor(status, messages) {
  if (status === 401) {
    return { kind: 'unauthenticated', options: { globalMessage: messages.unauthenticated, severity: 'warning' } };
  }
  if (status === 403) return { kind: 'forbidden', options: { globalMessage: messages.forbidden } };
  if (status >= 500) return { kind: 'server', options: { globalMessage: messages.server } };
  return { kind: 'unknown', options: { globalMessage: messages.fallback } };
}

function mappedResult(kind, mapper, data) {
  const { fieldErrors = {}, globalMessage = null } = mapper(data) ?? {};
  return apiErrorResult(kind, { fieldErrors, globalMessage });
}

export default normalizeApiError;
