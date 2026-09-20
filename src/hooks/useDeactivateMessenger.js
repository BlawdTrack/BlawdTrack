import { useState } from 'react';

export const useDeactivateMessenger = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const deactivateMessenger = async (messengerId) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      // 1. Obtenemos el token (ajusta esto si en BlawdTrack usan Context o Zustand en lugar de localStorage)
      const token = localStorage.getItem('token'); 
      
      // 2. Usamos variables de entorno de Vite para la URL base, con fallback a localhost
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      // 3. Endpoint esperado por el backend para el mensajero (Courier)
      const response = await fetch(`${baseUrl}/api/v1/couriers/${messengerId}/deactivate`, {
        method: 'PATCH', // PATCH es ideal para actualizar solo un estado (activo -> inactivo)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Inyección del token JWT
        },
      });

      if (!response.ok) {
        // Manejo de errores basado en el status HTTP
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Ocurrió un error al desactivar el mensajero');
      }

      setIsSuccess(true);
      return true; // Retornamos true para que el modal sepa que todo salió bien
      
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deactivateMessenger, isLoading, error, isSuccess };
};