import { normalizeApiError } from './apiErrors';

const MESSAGES = {
  network: 'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.',
  unauthenticated: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  forbidden: 'No tienes permisos para buscar paquetes. Solo un administrador de ventas puede hacerlo.',
  server: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo en unos minutos.',
  fallback: 'No se pudo realizar la búsqueda de paquetes. Intenta de nuevo.',
};

/**
 * Normaliza un error de la búsqueda de paquetes a un modelo de UI amigable.
 * @param {unknown} error
 * @returns {{ globalMessage: string }}
 */
export function normalizePackageSearchError(error) {
  const normalized = normalizeApiError(error, {
    messages: MESSAGES,
    mapValidation: () => ({ globalMessage: MESSAGES.fallback }),
    mapConflict: () => ({ globalMessage: MESSAGES.fallback }),
  });

  return {
    globalMessage: normalized.globalMessage || MESSAGES.fallback,
  };
}

export default normalizePackageSearchError;
