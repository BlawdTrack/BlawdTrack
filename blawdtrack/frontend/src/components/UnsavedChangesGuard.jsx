import { useContext, useEffect, useRef } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import ConfirmLeaveDialog from './ConfirmLeaveDialog';

function RouteBlocker({ shouldBlock }) {
  const blocker = useBlocker(shouldBlock);

  return (
    <ConfirmLeaveDialog
      open={blocker.state === 'blocked'}
      onStay={() => blocker.reset()}
      onLeave={() => blocker.proceed()}
    />
  );
}

/**
 * Protege los cambios sin guardar mientras `when` sea verdadero: avisa con un cuadro de confirmación si
 * la persona intenta ir a otra pantalla de la aplicación y con el aviso del navegador si intenta cerrar
 * o recargar la pestaña. El bloqueo de rutas solo existe con un router de datos (`createBrowserRouter`);
 * con otro tipo de router (por ejemplo, en pruebas aisladas) solo actúa el aviso del navegador.
 * @param {{ when: boolean | (() => boolean) }} props `when` puede ser una función: se evalúa en el momento
 *   de salir, útil cuando la propia pantalla decide irse (por ejemplo, tras guardar) y no debe bloquearse.
 */
export default function UnsavedChangesGuard({ when }) {
  const inDataRouter = useContext(UNSAFE_DataRouterContext) != null;
  const shouldBlock = typeof when === 'function' ? when : () => Boolean(when);

  // Siempre apunta a la versión más reciente, sin volver a registrar el aviso del navegador en cada render.
  const shouldBlockRef = useRef(shouldBlock);
  useEffect(() => {
    shouldBlockRef.current = shouldBlock;
  });

  useEffect(() => {
    const warnBeforeUnload = (event) => {
      if (!shouldBlockRef.current()) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, []);

  return inDataRouter ? <RouteBlocker shouldBlock={shouldBlock} /> : null;
}
