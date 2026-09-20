import { useState } from 'react';
import { login as loginService } from '../services/AuthService';

/**
 * Custom hook to manage the login request and its state.
 */
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginService(email, password);
      return response;
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      setError(backendMessage || 'No se pudo iniciar sesión. Intente de nuevo.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => setError(null);

  return { login, loading, error, resetError };
};

export default useAuth;
