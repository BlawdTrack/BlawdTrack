import { useState } from 'react';

export const useDeactivateMessenger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Recibimos nationalId en lugar del ID interno
  const deactivate = async (nationalId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // Se usa PUT y la ruta con nationalId de forma provisional.
      // Fácil de actualizar cuando se resuelva la Task #81.
      const response = await fetch(`${baseUrl}/api/v1/couriers/${nationalId}`, {
        method: 'PUT', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'INACTIVE' })
      });

      if (!response.ok) {
        // Intentamos leer el JSON del backend para sacar el mensaje (ej. el error 409)
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error inesperado al intentar desactivar el mensajero.');
      }

      setIsLoading(false);
      return { success: true };
      
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      return { success: false };
    }
  };

  const clearError = () => setError(null);

  return { deactivate, isLoading, error, clearError };
};