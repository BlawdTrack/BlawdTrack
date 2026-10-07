import { useCallback, useEffect, useState } from 'react';
import { listCouriers } from '../services/CourierService';

// Pide la flota; si falla, la deja vacía en lugar de romper la pantalla.
async function fetchFleet() {
  try {
    const data = await listCouriers();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al cargar la flota de mensajeros:', err);
    return [];
  }
}

/**
 * La flota de mensajeros (`GET /api/v1/couriers`): se carga al abrir la pantalla y se puede recargar o
 * actualizar un mensajero en memoria tras guardarlo, sin volver a pedir toda la lista.
 * @returns {{ couriers: object[], loading: boolean, reload: Function, patch: (courier: object) => void }}
 */
export function useCourierFleet() {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial: el estado "cargando" ya arranca en true, así que no hace falta marcarlo aquí.
  useEffect(() => {
    let active = true;
    fetchFleet().then((data) => {
      if (!active) return;
      setCouriers(data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setCouriers(await fetchFleet());
    setLoading(false);
  }, []);

  const patch = useCallback((updated) => {
    setCouriers((previous) => previous.map((courier) => (
      courier.id === updated.id ? { ...courier, ...updated } : courier
    )));
  }, []);

  return { couriers, loading, reload, patch };
}
