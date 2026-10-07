import { useCallback, useEffect, useState } from 'react';
import { listCouriers } from '../services/CourierService';
import { keepIfEqual } from './usePolling';

// Pide la flota y valida que sea una lista; si no, lanza un error con un mensaje que se pueda mostrar.
async function fetchFleet() {
  const data = await listCouriers();
  if (!Array.isArray(data)) {
    throw new Error('La respuesta del backend no contiene una lista de mensajeros.');
  }
  return data;
}

const describeError = (err) => ({
  message: err.response?.data?.message || err.message || 'No se pudo cargar la lista de mensajeros.',
  status: err.response?.status ?? null,
});

/**
 * La flota de mensajeros (`GET /api/v1/couriers`): se carga al abrir la pantalla; se puede recargar,
 * refrescar en silencio (para el sondeo periódico), o actualizar un mensajero en memoria tras guardarlo
 * sin volver a pedir toda la lista.
 * @returns {{ couriers: object[], loading: boolean, error: { message: string, status: number|null } | null,
 *   reload: Function, refresh: Function, patch: (courier: object) => void }} `error` solo informa de un
 *   fallo al cargar; con error la lista queda vacía.
 */
export function useCourierFleet() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga inicial: el estado "cargando" ya arranca en true, así que no hace falta marcarlo aquí.
  useEffect(() => {
    let active = true;
    fetchFleet()
      .then((data) => {
        if (active) setCouriers(data);
      })
      .catch((err) => {
        console.error('Error al cargar la flota de mensajeros:', err);
        if (active) setError(describeError(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setCouriers(await fetchFleet());
      setError(null);
    } catch (err) {
      console.error('Error al cargar la flota de mensajeros:', err);
      setCouriers([]);
      setError(describeError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // Falla en silencio: si una consulta no responde (o la sesión venció, de lo que ya se encarga el
  // interceptor) se conserva la lista que hay.
  const refresh = useCallback(async () => {
    try {
      const next = await fetchFleet();
      setCouriers((current) => keepIfEqual(current, next));
    } catch (err) {
      console.error('No se pudo actualizar la lista de mensajeros:', err);
    }
  }, []);

  const patch = useCallback((updated) => {
    setCouriers((previous) => previous.map((courier) => (
      courier.id === updated.id ? { ...courier, ...updated } : courier
    )));
  }, []);

  return { couriers, loading, error, reload, refresh, patch };
}
