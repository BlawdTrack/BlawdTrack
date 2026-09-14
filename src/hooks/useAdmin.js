import { useState } from 'react';
import { registrarAdministrador } from '../services/AdminService';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (adminData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await registrarAdministrador(adminData);

      setSuccess(true);

      return response;
    } catch (err) {
      setError(
        err.message ||
        'Error al registrar el administrador'
      );

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
    registerAdmin: handleRegister,
    resetState
  };
};

export default useAdmin;