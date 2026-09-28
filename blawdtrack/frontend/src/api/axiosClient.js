import axios from 'axios';
import { handleUnauthorizedResponse } from './sessionExpiry';

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