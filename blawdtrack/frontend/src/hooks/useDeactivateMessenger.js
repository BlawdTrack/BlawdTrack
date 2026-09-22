import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { deactivateCourier } from '../services/CourierService';

export const useDeactivateMessenger = () => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const deactivate = async (nationalId) => {
    setIsLoading(true);
    setError(null);
    setStatus(null);

    try {
      await deactivateCourier(nationalId);
      return { success: true, status: 200 };
    } catch (requestError) {
      const responseStatus = requestError.response?.status ?? null;
      const message =
        requestError.response?.data?.message ||
        requestError.message ||
        'Error inesperado al intentar desactivar el mensajero.';

      setError(message);
      setStatus(responseStatus);

      if (responseStatus === 401) {
        logout();
      }

      return { success: false, status: responseStatus, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
    setStatus(null);
  };

  return { deactivate, isLoading, error, status, clearError };
};
