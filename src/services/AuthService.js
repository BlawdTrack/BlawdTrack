import axiosClient from '../api/axiosClient';

// El endpoint real de HU-001 (POST /api/v1/auth/login) ya está en develop,
// así que se quitaron los datos de prueba (mocks/authMock.js, mocks/mockUsers.js).
export const login = async (email, password) => {
  const response = await axiosClient.post('/v1/auth/login', { email, password });
  return response.data;
};
