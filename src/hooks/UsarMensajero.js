import { useState } from 'react';
import { registrarMensajero } from '@/services/ServicioMensajero';

export const usarMensajero = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitRegistro = async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await registrarMensajero(formData);
      setSuccess(true);
      return data;
    } catch (err) {
      const mensajeError = err.response?.data?.mensaje || 'Error al registrar el mensajero.';
      setError(mensajeError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitRegistro, loading, error, success };
};