import { useCallback, useEffect, useState } from 'react';
import { getAdministrators } from '../services/AdminService';
import { keepIfEqual } from './usePolling';

const LOAD_ERROR_MESSAGE = 'No se pudieron cargar los datos. Verifica la conexión con el servidor.';

/**
 * Los administradores de ventas (`GET /api/v1/admins`): se cargan al abrir la pantalla, se pueden
 * refrescar en silencio (para el sondeo periódico: así el estado de sesión se mantiene al día) y se quita
 * uno de la lista en memoria al eliminarlo.
 * @returns {{ admins: object[], loading: boolean, error: string|null, reload: Function, refresh: Function,
 *   removeByDocument: (documentNumber: string) => void }}
 */
export function useAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: el estado "cargando" ya arranca en true, así que no hace falta marcarlo aquí.
  useEffect(() => {
    let active = true;
    getAdministrators()
      .then((data) => {
        if (active) setAdmins(data);
      })
      .catch((err) => {
        console.error('Error al cargar administradores:', err);
        if (active) setError(LOAD_ERROR_MESSAGE);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Vuelve a pedir la lista tras un fallo de carga (el botón "Reintentar").
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setAdmins(await getAdministrators());
      setError(null);
    } catch (err) {
      console.error('Error al cargar administradores:', err);
      setError(LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  // Falla en silencio: si una consulta no responde se conserva la lista actual y se reintenta en el
  // siguiente ciclo.
  const refresh = useCallback(async () => {
    try {
      const data = await getAdministrators();
      setAdmins((current) => keepIfEqual(current, data));
    } catch (err) {
      console.error('No se pudo actualizar la lista de administradores:', err);
    }
  }, []);

  const removeByDocument = useCallback((documentNumber) => {
    setAdmins((current) => current.filter(
      (admin) => admin.documentNumber !== documentNumber
        && admin.identification !== documentNumber
        && admin.nationalId !== documentNumber
        && admin.id !== documentNumber
    ));
  }, []);

  return { admins, loading, error, reload, refresh, removeByDocument };
}
