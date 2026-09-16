// Datos de prueba para el endpoint de SOLICITUD de recuperación de
// contraseña. Contrato CONFIRMADO contra la rama feature/62-genesis-silesky
// (Task #62 — PasswordResetController, PasswordResetServiceImpl):
//
//   POST /v1/auth/password-reset/request   { email }
//   200  { message }   ← SIEMPRE, sin importar si el correo existe o la
//                         cuenta está activa. La decisión de generar el
//                         token vive solo en el service del backend; el
//                         controller nunca la expone, justamente para no
//                         permitir enumerar correos registrados.
//
// Por eso este mock no tiene ninguna rama de error de negocio: solo
// simula la latencia de red y devuelve siempre el mismo mensaje genérico
// (copiado tal cual del backend, PasswordResetController.GENERIC_MESSAGE).
//
// TODO: eliminar este archivo cuando el endpoint real esté disponible.

const MOCK_DELAY_MS = 600;

const GENERIC_MESSAGE =
  'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockRequestPasswordReset(_email) {
  await delay(MOCK_DELAY_MS);
  return { message: GENERIC_MESSAGE };
}
