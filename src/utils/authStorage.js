// Punto único para guardar, leer y borrar la sesión del usuario en el
// cliente (T16). El token se guarda bajo la misma clave 'token' que ya
// usa axiosClient.js (rama HU003), para no romper el interceptor que el
// equipo ya tiene funcionando. El resto del perfil (nombre, rol, permisos)
// se guarda junto en una sola clave, en vez de dejar varias claves sueltas
// en localStorage.

const TOKEN_KEY = 'token';
const USER_KEY = 'blawdtrack_user';

// El backend real (POST /api/v1/auth/login, LoginResponse.java) devuelve un
// objeto plano: { token, type, id, fullName, email, role, permissions } —
// no anida los datos del usuario bajo una clave 'user'. Se arma aquí el
// objeto de usuario a partir de esos campos planos antes de guardarlo.
export function buildUserFromLoginResponse(authResponse) {
  const { id, fullName, email, role, permissions } = authResponse;
  return { id, fullName, email, role, permissions };
}

export function saveAuthSession(authResponse) {
  const { token } = authResponse;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(buildUserFromLoginResponse(authResponse)));
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

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
