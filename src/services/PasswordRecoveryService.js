import axiosClient from '../api/axiosClient';

// El endpoint real de HU-002 (POST /api/v1/auth/password-reset/request) ya
// está en develop, así que no se usa el mock de blawdtrack/frontend/.
export const requestPasswordReset = async (email) => {
  const response = await axiosClient.post('/v1/auth/password-reset/request', { email });
  return response.data;
};
