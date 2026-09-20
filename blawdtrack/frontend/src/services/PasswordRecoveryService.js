import axiosClient from '../api/axiosClient';
import { mockRequestPasswordReset } from '../mocks/passwordRecoveryMock';

// Contrato confirmado con la rama feature/62-genesis-silesky
// (PasswordResetController, Task #62).
const USE_MOCK_RECOVERY = import.meta.env.VITE_USE_MOCK_RECOVERY !== 'false';

export const requestPasswordReset = async (email) => {
  if (USE_MOCK_RECOVERY) {
    return mockRequestPasswordReset(email);
  }

  const response = await axiosClient.post('/v1/auth/password-reset/request', { email });
  return response.data;
};
