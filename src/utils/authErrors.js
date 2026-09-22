// Mensajes de error del inicio de sesión (T13 / HU-001).
// El texto lo define el frontend según el código de la respuesta; el
// `message` del backend no se muestra (viene sin tildes y en otro idioma).

const CREDENTIALS_MESSAGE =
  'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.';
const INACTIVE_ACCOUNT_MESSAGE =
  'Tu cuenta está inactiva. Contacta a un administrador de BlawdTrack para reactivarla.';
const CONNECTION_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.';
const GENERIC_MESSAGE = 'No se pudo iniciar sesión. Intenta de nuevo en unos minutos.';

// Recibe el error de axios y devuelve { message, severity } para StatusMessage.
export function getLoginError(err) {
  const response = err?.response;

  // Sin respuesta: red caída o backend apagado.
  if (!response) {
    return { message: CONNECTION_MESSAGE, severity: 'error' };
  }

  const code = response.data?.code;

  if (code === 'CUENTA_INACTIVA') {
    return { message: INACTIVE_ACCOUNT_MESSAGE, severity: 'warning' };
  }
  if (code === 'CREDENCIALES_INVALIDAS') {
    return { message: CREDENTIALS_MESSAGE, severity: 'error' };
  }

  // Respaldo por estado HTTP si el código no llega en el cuerpo.
  if (!code && response.status === 403) {
    return { message: INACTIVE_ACCOUNT_MESSAGE, severity: 'warning' };
  }
  if (!code && response.status === 401) {
    return { message: CREDENTIALS_MESSAGE, severity: 'error' };
  }

  // VALIDATION_ERROR, INTERNAL_ERROR y cualquier otro 4xx/5xx.
  return { message: GENERIC_MESSAGE, severity: 'error' };
}
