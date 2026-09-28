// Puente entre el interceptor de axios (fuera de React) y el AuthProvider
// (T17). El interceptor no puede usar hooks, así que solo avisa a un
// "handler" que el AuthProvider registra al montarse; el provider limpia la
// sesión y la redirección al login la hace ProtectedRoute al ver user = null.
import { getStoredToken } from '../utils/authStorage';

// Aviso que se muestra en el login (StatusMessage, severity warning).
export const SESSION_EXPIRED_ERROR = {
  message: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
  severity: 'warning',
};

// El 401 del login (CREDENCIALES_INVALIDAS) y los de password-reset NO son
// sesión expirada: siguen mostrando su propio mensaje (T13).
const EXCLUDED_URL_PARTS = ['/v1/auth/login', '/v1/auth/password-reset'];

let sessionExpiredHandler = null;

// Registra quién limpia la sesión. Devuelve la función para desregistrarlo
// (cleanup del useEffect del AuthProvider).
export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) sessionExpiredHandler = null;
  };
}

function getSentAuthorization(config) {
  const headers = config?.headers;
  if (!headers) return undefined;
  return typeof headers.get === 'function' ? headers.get('Authorization') : headers.Authorization;
}

// Solo cuenta como sesión expirada un 401 con code NO_AUTENTICADO (token
// ausente, inválido o vencido en un endpoint protegido). Un 403
// (ACCESO_DENEGADO, CUENTA_INACTIVA) no cierra la sesión.
export function isSessionExpiredResponse(error) {
  const response = error?.response;
  if (!response || response.status !== 401) return false;
  if (response.data?.code !== 'NO_AUTENTICADO') return false;

  const url = error.config?.url ?? '';
  if (EXCLUDED_URL_PARTS.some((part) => url.includes(part))) return false;

  // Solo si la petición fallida llevaba el token que sigue vigente. Con
  // varios 401 a la vez, el primero limpia el token y los demás ya no
  // coinciden (se ignoran); tampoco un 401 tardío de una sesión anterior
  // cierra una sesión nueva.
  const currentToken = getStoredToken();
  if (!currentToken) return false;
  return getSentAuthorization(error.config) === `Bearer ${currentToken}`;
}

export function handleUnauthorizedResponse(error) {
  if (sessionExpiredHandler && isSessionExpiredResponse(error)) {
    sessionExpiredHandler();
  }
}
