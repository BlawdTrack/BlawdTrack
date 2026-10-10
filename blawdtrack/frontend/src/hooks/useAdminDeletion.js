import { useState } from 'react';
import { deleteAdministrator } from '../services/AdminService';

const MISSING_DATA_MESSAGE = 'No se puede procesar la solicitud porque faltan datos del administrador.';

function describeDeleteError(err) {
  const status = err.response?.status;
  if (status === 404) return 'Administrador no existente.';
  if (status === 401 || status === 403) return 'No cuenta con permisos para eliminar administradores.';
  return err.response?.data?.message || 'No se pudo eliminar el administrador. Intenta nuevamente.';
}

/**
 * Eliminación de un administrador (HU-008): cuál está seleccionado para confirmar, la llamada al backend
 * y el mensaje de error que ve la persona en el cuadro de confirmación.
 * @param {{ onDeleted: (documentNumber: string) => void,
 *   notify: (message: string, severity?: string) => void }} options `onDeleted` se llama una vez eliminado;
 *   `notify` muestra los avisos (éxito, o error cuando el cuadro ya no está abierto).
 * @returns {{ selected: object|null, error: string|null, isDeleting: boolean, open: (admin: object) => void,
 *   close: Function, confirm: (documentType: string, documentNumber: string) => Promise<void> }}
 */
export function useAdminDeletion({ onDeleted, notify }) {
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const open = (admin) => {
    setError(null);
    setSelected(admin);
  };

  const close = () => {
    if (isDeleting) return;
    setSelected(null);
    setError(null);
  };

  const confirm = async (documentType, documentNumber) => {
    if (!documentType || !documentNumber) {
      console.error('Intento de eliminación fallido: documento indefinido o vacío.');
      close();
      notify(MISSING_DATA_MESSAGE, 'error');
      return;
    }

    try {
      setError(null);
      setIsDeleting(true);
      await deleteAdministrator(documentType, documentNumber);
      onDeleted(documentNumber);
      setSelected(null);
      notify('Administrador eliminado correctamente.', 'success');
    } catch (err) {
      console.error('Error al eliminar administrador:', err);
      setError(describeDeleteError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return { selected, error, isDeleting, open, close, confirm };
}
