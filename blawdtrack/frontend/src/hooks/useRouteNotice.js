import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Aviso que una pantalla deja al navegar a otra (por ejemplo, "Mensajero creado correctamente" al volver
 * al menú del módulo): se envía en `navigate(ruta, { state: { notice: { message, severity } } })` y la
 * pantalla de destino lo muestra una sola vez. El aviso se quita del historial al leerlo, así que no
 * reaparece al recargar la página.
 * @returns {{ notice: { message: string, severity?: string } | null, open: boolean, close: Function }}
 */
export function useRouteNotice() {
  const location = useLocation();
  const navigate = useNavigate();
  const [notice] = useState(() => location.state?.notice ?? null);
  const [open, setOpen] = useState(Boolean(notice));
  const hasPendingNotice = Boolean(location.state?.notice);

  useEffect(() => {
    if (hasPendingNotice) navigate(location.pathname, { replace: true, state: null });
  }, [hasPendingNotice, location.pathname, navigate]);

  return { notice, open, close: () => setOpen(false) };
}
