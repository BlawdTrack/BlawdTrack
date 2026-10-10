import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfirmLeave } from './useConfirmLeave';

/**
 * Protege un formulario de creación: avisa si se intenta salir con datos sin guardar (`UnsavedChangesGuard`
 * y `ConfirmLeaveDialog`), ofrece "Descartar" (pregunta solo si hay datos y vuelve a `discardTo`) y deja
 * salir sin avisos cuando la propia pantalla decide irse (por ejemplo, tras crear con éxito).
 * @param {{ isDirty: boolean, discardTo: string }} options `discardTo` es la ruta a la que lleva "Descartar".
 * @returns {{ shouldBlock: () => boolean, dialogProps: object, discard: Function,
 *   leave: (to: string, options?: object) => void }} `shouldBlock` va a `<UnsavedChangesGuard when />` y
 *   `dialogProps` a `<ConfirmLeaveDialog />`.
 */
export function useFormLeave({ isDirty, discardTo }) {
  const navigate = useNavigate();
  const leavingRef = useRef(false);
  const { runOrConfirmLeave, dialogProps } = useConfirmLeave(isDirty);

  // Se evalúa en el momento de navegar: si la pantalla ya decidió irse, no se bloquea a sí misma.
  const shouldBlock = () => isDirty && !leavingRef.current;

  const leave = (to, options) => {
    leavingRef.current = true;
    navigate(to, options);
  };

  const discard = () => runOrConfirmLeave(() => leave(discardTo));

  return { shouldBlock, dialogProps, discard, leave };
}
