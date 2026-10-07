import { useState } from 'react';

/**
 * Pide confirmación antes de abandonar lo que se está editando (pasar a otro elemento, volver, etc.)
 * cuando hay cambios sin guardar. `runOrConfirmLeave(accion)` ejecuta la acción de inmediato si todo
 * está guardado o, si no, abre el aviso y la ejecuta solo si la persona confirma.
 * @param {boolean} isDirty Hay cambios sin guardar.
 * @returns {{ runOrConfirmLeave: (action: Function) => void,
 *   dialogProps: { open: boolean, onStay: Function, onLeave: Function } }} `dialogProps` va directo a
 *   `<ConfirmLeaveDialog />`.
 */
export function useConfirmLeave(isDirty) {
  const [pendingAction, setPendingAction] = useState(null);

  const runOrConfirmLeave = (action) => {
    if (isDirty) {
      setPendingAction(() => action);
      return;
    }
    action();
  };

  const dialogProps = {
    open: Boolean(pendingAction),
    onStay: () => setPendingAction(null),
    onLeave: () => {
      const action = pendingAction;
      setPendingAction(null);
      action?.();
    },
  };

  return { runOrConfirmLeave, dialogProps };
}
