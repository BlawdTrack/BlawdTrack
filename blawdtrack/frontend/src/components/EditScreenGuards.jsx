import ConfirmLeaveDialog from './ConfirmLeaveDialog';
import Toast from './Toast';
import UnsavedChangesGuard from './UnsavedChangesGuard';

/**
 * Lo que comparten las pantallas de edición de cuentas fuera de su contenido: avisar antes de salir con cambios sin
 * guardar (el guardia y su diálogo) y el aviso flotante del resultado.
 * @param {{ dirty: boolean, dialogProps: object, toast: { open: boolean, message: string, severity: string },
 *   onCloseToast: Function }} props `dialogProps` son los del hook `useConfirmLeave`.
 */
export default function EditScreenGuards({ dirty, dialogProps, toast, onCloseToast }) {
  return (
    <>
      <UnsavedChangesGuard when={dirty} />
      <ConfirmLeaveDialog {...dialogProps} />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={onCloseToast} />
    </>
  );
}
