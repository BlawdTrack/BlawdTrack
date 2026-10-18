import { useState } from 'react';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import AdminDetailPanel from '../components/AdminDetailPanel';
import AdminEditListPanel from '../components/AdminEditListPanel';
import CourierGeneralHistoryPanel from '../components/CourierGeneralHistoryPanel';
import EditScreenGuards from '../components/EditScreenGuards';
import EmptyState from '../components/EmptyState';
import SplitScreen from '../components/SplitScreen';
import { useAdminEditor } from '../hooks/useAdminEditor';
import { useAdminGeneralHistory } from '../hooks/useAdminHistory';
import { useAdmins } from '../hooks/useAdmins';
import { useConfirmLeave } from '../hooks/useConfirmLeave';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { useToast } from '../hooks/useToast';
import { getAdminDocument, getAdminName } from '../utils/adminEdit';
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
  const generalHistory = useAdminGeneralHistory();

  // La lista se puede ocultar para darle todo el ancho al formulario (solo escritorio), y el historial general
  // reemplaza al detalle en el panel derecho mientras se ve.
  const [listOpen, setListOpen] = useState(true);
  const [showGeneral, setShowGeneral] = useState(false);

  const backToPicker = () => {
    setListOpen(true);
    setShowGeneral(false);
  };

  const editor = useAdminEditor({
    notify,
    onSaved: (updated) => {
      patch(updated);
      backToPicker();
    },
    // El administrador ya no existe (p. ej. lo eliminaron): se vuelve a pedir la lista.
    onGone: () => reload(),
  });
  const { runOrConfirmLeave, dialogProps } = useConfirmLeave(editor.isDirty);

  const handleSelect = (admin) => {
    if (admin.id === editor.admin?.id) {
      setShowGeneral(false);
      return;
    }
    runOrConfirmLeave(() => {
      setShowGeneral(false);
      editor.select(admin);
    });
  };

  // "Descartar" abandona la edición de una vez; "Volver" pide confirmar si hay cambios sin guardar.
  const handleDiscard = () => {
    editor.clear();
    backToPicker();
  };
  const handleBack = () => runOrConfirmLeave(handleDiscard);

  const openGeneralHistory = () => {
    setShowGeneral(true);
    generalHistory.load();
  };

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
          selectedKey={editor.admin ? getAdminDocument(editor.admin) : null}
          search={search}
          onSelect={handleSelect}
          onRetry={reload}
          canHide={Boolean(editor.admin)}
          onHide={() => setListOpen(false)}
          onOpenGeneralHistory={openGeneralHistory}
          generalHistoryOpen={showGeneral}
          sx={{ display: { xs: editor.admin || showGeneral ? 'none' : 'flex', md: listOpen ? 'flex' : 'none' } }}
        />

        {showGeneral && (
          <CourierGeneralHistoryPanel
            history={generalHistory}
            backLabel={editor.admin ? `Volver a ${getAdminName(editor.admin)}` : 'Volver'}
            onBack={() => setShowGeneral(false)}
            title="Historial general de administradores"
            emptyMessage="Todavía no hay cambios registrados en ningún administrador."
            errorMessage="No se pudo cargar el historial general. Revisa tu conexión e inténtalo de nuevo."
          />
        )}
        {!showGeneral && editor.admin && (
          <AdminDetailPanel
            key={editor.admin.id}
            editor={editor}
            onBack={handleBack}
            onDiscard={handleDiscard}
            listOpen={listOpen}
            onShowList={() => setListOpen(true)}
          />
        )}
        {!showGeneral && !editor.admin && (
          <EmptyState
            icon={PersonSearchOutlinedIcon}
            title="Elige un administrador"
            description="Selecciona un administrador de la lista para editar sus datos y ver su historial."
            sx={{ display: { xs: 'none', md: 'flex' } }}
          />
        )}
      </SplitScreen>

      <EditScreenGuards dirty={editor.isDirty} dialogProps={dialogProps} toast={toast} onCloseToast={closeToast} />
    </>
  );
}

export default EditAdmin;
