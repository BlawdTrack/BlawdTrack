// Normaliza un POST /api/v1/packages/import/preview fallido (error de axios) al mismo modelo uniforme que
// courierErrors.js y adminErrors.js (ver ./apiErrors para el mapeo código HTTP -> "kind"). Aquí solo se agregan
// los textos de la importación y el caso propio del archivo: el backend responde 400 con
// code = INVALID_PACKAGE_FILE y un mensaje en español que dice qué tiene mal el archivo.

import { apiErrorResult, normalizeApiError } from './apiErrors';

export const INVALID_PACKAGE_FILE_CODE = 'INVALID_PACKAGE_FILE';

const MESSAGES = {
  validationGeneric: 'No se pudo leer el archivo. Revisa que sea el listado de Zoho Inventory.',
  invalidFile: 'El archivo no es válido. Revisa que sea el listado de Zoho Inventory e intenta de nuevo.',
  tooLarge: 'El archivo es demasiado grande para cargarlo. Divídelo en partes más pequeñas e intenta de nuevo.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  forbidden: 'No tienes permiso para importar paquetes.',
  server: 'Ocurrió un error inesperado al procesar el archivo. Intenta de nuevo en unos minutos.',
  network: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  fallback: 'No se pudo cargar el archivo. Intenta de nuevo.',
};

/**
 * @param {unknown} error Error de axios de la carga del archivo.
 * @returns {{ kind: string, fieldErrors: object, globalMessage: string|null, severity: string }}
 */
export function normalizePackageImportError(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (status === 400 && data?.code === INVALID_PACKAGE_FILE_CODE) {
    return apiErrorResult('validation', { globalMessage: data.message || MESSAGES.invalidFile });
  }
  if (status === 413) {
    return apiErrorResult('validation', { globalMessage: MESSAGES.tooLarge });
  }

  return normalizeApiError(error, {
    messages: MESSAGES,
    mapValidation: () => ({ globalMessage: MESSAGES.validationGeneric }),
    mapConflict: () => ({ globalMessage: MESSAGES.fallback }),
  });
}

export default normalizePackageImportError;
