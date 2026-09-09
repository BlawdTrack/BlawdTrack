import { useState } from 'react';
import { registerCourier } from '../services/CourierService';

/**
 * Custom hook to manage courier-related operations and state
 */
export const useCourier = () => {
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
      setError(err.message || 'Error executing courier registration');
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
    resetState
  };
};

export default useCourier;