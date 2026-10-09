import axios from 'axios';
import { handleUnauthorizedResponse } from './sessionExpiry';

/**
 * Cliente HTTP compartido por todos los servicios. La URL base sale de `VITE_API_URL`; el interceptor
 * de solicitud agrega `Authorization: Bearer <token>` con el token guardado en `localStorage`, y el de
 * respuesta avisa al `AuthProvider` cuando llega un 401 de sesión vencida.
 */
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// T17: un 401 NO_AUTENTICADO en un endpoint protegido avisa al AuthProvider
// para cerrar la sesión. El error siempre se propaga igual que antes.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    handleUnauthorizedResponse(error);
    return Promise.reject(error);
  }
);

export default axiosClient;