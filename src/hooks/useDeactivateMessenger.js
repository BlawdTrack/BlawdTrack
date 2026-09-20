// src/hooks/useDeactivateMessenger.js
import { useState } from 'react';
/**
 * HOOK PERSONALIZADO DE LÓGICA DE NEGOCIO Y PETICIONES HTTP
 * 
 * - Encapsula el consumo del endpoint DELETE /api/messengers/:id.
 * - Mantiene el estado del ciclo de vida de la petición (`loading`, `error`).
 * - Puede ser importado por cualquier vista, tabla o formulario sin acoplamiento a componentes visuales.
 */
export const useDeactivateMessenger = (apiUrl = 'http://localhost:8080/api/messengers') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deactivateMessenger = async (messengerId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/${messengerId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo desactivar el mensajero`);
      }

      return true; // Éxito
    } catch (err) {
      setError(err.message || 'Error de conexión');
      return false; // Fallo
    } finally {
      setLoading(false);
    }
  };

  return { deactivateMessenger, loading, error };
};