import { useContext, useEffect } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router-dom';
import ConfirmLeaveDialog from './ConfirmLeaveDialog';

function RouteBlocker({ when }) {
  const blocker = useBlocker(when);

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
 * @param {{ when: boolean }} props
 */
export default function UnsavedChangesGuard({ when }) {
  const inDataRouter = useContext(UNSAFE_DataRouterContext) != null;

  useEffect(() => {
    if (!when) return undefined;

    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeUnload);
    return () => window.removeEventListener('beforeunload', warnBeforeUnload);
  }, [when]);

  return inDataRouter ? <RouteBlocker when={when} /> : null;
}
