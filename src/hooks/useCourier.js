import { useState } from 'react';
import { registerCourier, updateCourier, getCourierByCedula } from '../services/CourierService';
import { useAuth } from './useAuth';

/**
 * Custom hook to manage courier-related operations and state
 */
export const useCourier = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (courierData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await registerCourier(courierData);
      setSuccess(true);
      return response;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error executing courier registration';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (idCard, courierData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateCourier(idCard, courierData);
      setSuccess(true);
      return response;
    } catch (err) {
      if (err.response?.status === 401 && logout) {
        logout();
      }
      const msg = err.response?.data?.message || err.message || 'Error al actualizar datos del mensajero.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGetByCedula = async (idCard) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCourierByCedula(idCard);
      return data;
    } catch (err) {
      if (err.response?.status === 401 && logout) {
        logout();
      }
      const msg = err.response?.data?.message || err.message || 'Mensajero no encontrado.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    registerCourier: handleRegister,
    updateCourier: handleUpdate,
    getCourierByCedula: handleGetByCedula,
    resetState
  };
};

export default useCourier;