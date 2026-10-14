import { useState } from 'react';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import AdminDetailPanel from '../components/AdminDetailPanel';
import AdminEditListPanel from '../components/AdminEditListPanel';
import ConfirmLeaveDialog from '../components/ConfirmLeaveDialog';
import EmptyState from '../components/EmptyState';
import SplitScreen from '../components/SplitScreen';
import Toast from '../components/Toast';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useAdminEditor } from '../hooks/useAdminEditor';
import { useAdmins } from '../hooks/useAdmins';
import { useConfirmLeave } from '../hooks/useConfirmLeave';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { useToast } from '../hooks/useToast';
import { getAdminDocument } from '../utils/adminEdit';
import { rem } from '../theme';

/**
 * Pantalla "Actualizar administrador" (HU-007), exclusiva del Súper Usuario. En una sola vista a la altura de la
 * pantalla, a la izquierda los administradores de ventas (con búsqueda por documento) y a la derecha el elegido, con su
 * formulario prellenado. Equivale a "Actualizar mensajero" (`EditMessenger`). Esta página solo coordina las piezas:
 * la lista (`useAdmins`), la edición (`useAdminEditor`), los avisos (`useToast`) y la protección de cambios sin
 * guardar (`useConfirmLeave`).
 */
export function EditAdmin() {
  const { toast, notify, close: closeToast } = useToast();
  const { admins, loading, error, reload, patch } = useAdmins();
  const search = useDocumentSearch(getAdminDocument);

  // La lista se puede ocultar para darle todo el ancho al formulario (solo escritorio).
  const [listOpen, setListOpen] = useState(true);

  const editor = useAdminEditor({
    notify,
    onSaved: (updated) => {
      patch(updated);
      setListOpen(true);
    },
    // El administrador ya no existe (p. ej. lo eliminaron): se vuelve a pedir la lista.
    onGone: () => reload(),
  });
  const { runOrConfirmLeave, dialogProps } = useConfirmLeave(editor.isDirty);

  const handleSelect = (admin) => {
    if (admin.id === editor.admin?.id) return;
    runOrConfirmLeave(() => editor.select(admin));
  };

  // "Descartar" abandona la edición de una vez; "Volver" pide confirmar si hay cambios sin guardar.
  const handleDiscard = () => {
    editor.clear();
    setListOpen(true);
  };
  const handleBack = () => runOrConfirmLeave(handleDiscard);

  return (
    <>
      <SplitScreen
        title="Actualizar administrador"
        columns={listOpen ? `${rem(380)} minmax(0, 1fr)` : 'minmax(0, 1fr)'}
      >
        <AdminEditListPanel
          admins={search.filter(admins)}
          totalCount={admins.length}
          loading={loading}
          errorMessage={error}
          search={search}
          onSelect={handleSelect}
          selecting={editor.loading}
          onRetry={reload}
          sx={{ display: { xs: editor.admin ? 'none' : 'flex', md: listOpen ? 'flex' : 'none' } }}
        />

        {editor.admin ? (
          <AdminDetailPanel
            key={editor.admin.id}
            editor={editor}
            onBack={handleBack}
            onDiscard={handleDiscard}
            listOpen={listOpen}
            onShowList={() => setListOpen(true)}
          />
        ) : (
          <EmptyState
            icon={PersonSearchOutlinedIcon}
            title="Elige un administrador"
            description="Busca un administrador por su documento, o elígelo de la lista, para editar su nombre, correo, contraseña o estado de acceso."
            sx={{ display: { xs: 'none', md: 'flex' } }}
          />
        )}
      </SplitScreen>

      <UnsavedChangesGuard when={editor.isDirty} />
      <ConfirmLeaveDialog {...dialogProps} />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </>
  );
}

export default EditAdmin;
