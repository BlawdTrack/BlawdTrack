import axiosClient from '../api/axiosClient';

// El endpoint real de HU-002 (POST /api/v1/auth/password-reset/request) ya
// está disponible, así que no se usa un mock.
export const requestPasswordReset = async (email) => {
  const response = await axiosClient.post('/v1/auth/password-reset/request', { email });
  return response.data;
};

// T05 (HU-002, #66). CONTRATO PENDIENTE DE CONFIRMAR con el equipo de
// backend: se leyó del código del backend en develop
// (PasswordResetController.confirmPasswordReset y PasswordResetServiceImpl,
// carpeta blawdtrack/), no se ha validado con ellos:
//
//   POST /v1/auth/password-reset/confirm   { token, newPassword }
//   200  { message }
//   400  { code: 'TOKEN_INVALIDO' }          token inexistente, usado o vencido
//   400  { code: 'CONTRASENA_REUTILIZADA' }  igual a la actual o a las últimas 2
//   400  { code: 'VALIDATION_ERROR' }        newPassword sin 8+ caracteres con
//                                            letras y números, o token vacío
export const confirmPasswordReset = async (token, newPassword) => {
  const response = await axiosClient.post('/v1/auth/password-reset/confirm', { token, newPassword });
  return response.data;
};
