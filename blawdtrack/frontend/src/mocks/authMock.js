// Datos de prueba para simular POST /api/v1/auth/login. Contrato
// CONFIRMADO contra la rama feature/HU001-LuisMadrigal:
//
//   200  { token, tokenType, expiresInSeconds, user: { id, fullName, email, role } }
//   401  { code: 'CREDENCIALES_INVALIDAS', message, status }  (correo o contraseña incorrectos)
//   403  { code: 'CUENTA_INACTIVA', message, status }         (cuenta inactiva)
//
// Los textos de error son copia literal de AuthService.java (incluye la
// falta de tildes tal como está en el backend real).
//
// TODO: eliminar este archivo cuando el endpoint real esté desplegado.

import { mockUsers } from './mockUsers';

const MOCK_DELAY_MS = 600;
const TOKEN_EXPIRATION_SECONDS = 3600;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function throwAuthError(code, message, status) {
  const error = new Error(message);
  error.response = { status, data: { code, message, status } };
  throw error;
}

export async function mockLogin(email, password) {
  await delay(MOCK_DELAY_MS);

  const user = mockUsers.find(
    (candidate) => candidate.email.toLowerCase() === String(email).toLowerCase()
  );

  if (!user || user.password !== password) {
    throwAuthError(
      'CREDENCIALES_INVALIDAS',
      'El correo electronico o la contrasena son incorrectos.',
      401
    );
  }

  if (user.status === 'INACTIVE') {
    throwAuthError(
      'CUENTA_INACTIVA',
      'La cuenta se encuentra inactiva. Contacte al Super Usuario para reactivarla.',
      403
    );
  }

  return {
    token: `mock-jwt-token-${user.id}-${Date.now()}`,
    tokenType: 'Bearer',
    expiresInSeconds: TOKEN_EXPIRATION_SECONDS,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}
