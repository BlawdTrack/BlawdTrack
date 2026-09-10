import axiosClient from '../api/axiosClient';
import { mockLogin } from '../mocks/authMock';

// Mientras el backend de HU-001 no esté desplegado, se usan datos de prueba.
// Cuando el endpoint quede disponible: poner VITE_USE_MOCK_AUTH=false en el
// .env (o borrar esta bandera y el bloque de mock) y no hay que tocar nada
// más — el hook y la página ya consumen esta función tal cual.
const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

export const login = async (email, password) => {
  if (USE_MOCK_AUTH) {
    return mockLogin(email, password);
  }

  const response = await axiosClient.post('/v1/auth/login', { email, password });
  return response.data;
};
