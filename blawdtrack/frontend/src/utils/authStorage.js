// Punto único para guardar, leer y borrar la sesión del usuario en el
// cliente (T16). El token se guarda bajo la misma clave 'token' que ya
// usa axiosClient.js (rama HU003), para no romper el interceptor que el
// equipo ya tiene funcionando. El resto del perfil (nombre, rol, permisos)
// se guarda junto en una sola clave, en vez de dejar varias claves sueltas
// en localStorage.
//
// Riesgo aceptado (HU-001): el JWT vive en localStorage, legible por
// cualquier script que corra en la página (XSS), a diferencia de una cookie
// httpOnly. Se eligió así porque este SPA no tiene backend-for-frontend que
// pueda setear/leer una cookie httpOnly junto con la API real (que vive en
// otro origen); migrar exigiría rediseñar todo el flujo de auth (CSRF,
// logout con endpoint que borre la cookie, detección de expiración sin
// poder leer el payload del token en el cliente). Mitigación real hoy:
// ningún componente usa dangerouslySetInnerHTML, .innerHTML, eval() ni
// libs de render de HTML/markdown (auditado en esta misma tarea) — sin una
// vía de inyección, el token no es exfiltrable. Si se agrega alguna de esas
// vías más adelante, hay que sanitizar esa entrada o reabrir esta decisión.

const TOKEN_KEY = 'token';
const USER_KEY = 'blawdtrack_user';

// El backend vivo (blawdtrack/, auth/dto/LoginResponse.java) devuelve un
// objeto plano: { token, type, id, fullName, email, role, permissions } —
// no anida los datos del usuario bajo una clave 'user'. Se arma aquí el
// objeto de usuario a partir de esos campos planos antes de guardarlo.
/**
 * Arma el objeto de usuario de la sesión a partir de la respuesta del login.
 * @param {{ id: number, fullName: string, email: string, role: string, permissions: string[] }} authResponse
 * @returns {{ id: number, fullName: string, email: string, role: string, permissions: string[] }}
 */
export function buildUserFromLoginResponse(authResponse) {
  const { id, fullName, email, role, permissions } = authResponse;
  return { id, fullName, email, role, permissions };
}

/**
 * Guarda el token y el perfil del usuario en `localStorage`.
 * @param {{ token: string }} authResponse Respuesta del login.
 * @throws {Error} Si la respuesta no trae un token.
 */
export function saveAuthSession(authResponse) {
  const { token } = authResponse;
  // Sin token no hay sesión: evita guardar la cadena "undefined" en localStorage
  // y dejar una sesión a medias (usuario guardado, token inválido).
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('La respuesta del backend no incluye un token de sesión.');
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(buildUserFromLoginResponse(authResponse)));
}

/** @returns {string|null} El token guardado, o `null` si no hay sesión. */
export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** @returns {object|null} El perfil guardado, o `null` si falta o está corrupto (se descarta). */
export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // Datos corruptos o de un formato viejo: se descarta solo esta entrada,
    // sin arrastrar el borrado del token (que puede seguir siendo válido).
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

/** Borra el token y el perfil guardados (cierre de sesión). */
export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Decodifica el payload de un JWT sin verificar la firma (eso lo hace el
// backend); solo sirve para leer 'exp' y saber si ya venció. El token de
// prueba (mock) no es un JWT real, así que si no se puede decodificar se
// asume que sigue vigente en vez de cerrar la sesión por error.
function decodeJwtPayload(token) {
  try {
    const payloadBase64 = token.split('.')[1];
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Indica si hay una sesión vigente: token y perfil guardados y, si el token es un JWT, sin vencer. Si
 * ya venció, limpia la sesión guardada.
 * @returns {boolean}
 */
export function hasActiveSession() {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return false;

  const payload = decodeJwtPayload(token);
  if (payload?.exp && Date.now() >= payload.exp * 1000) {
    clearAuthSession();
    return false;
  }

  return true;
}
