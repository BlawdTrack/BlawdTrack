import { useState } from 'react';
import AdminListPanel from '../components/AdminListPanel';
import AuditPanel from '../components/AuditPanel';
import DeleteAdminModal from '../components/DeleteAdminModal';
import SplitScreen from '../components/SplitScreen';
import Toast from '../components/Toast';
import { useAdminAuditLog } from '../hooks/useAdminAuditLog';
import { useAdminDeletion } from '../hooks/useAdminDeletion';
import { useAdmins } from '../hooks/useAdmins';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { usePolling } from '../hooks/usePolling';
import { useToast } from '../hooks/useToast';

/**
 * Pantalla "Eliminar administrador" (HU-008), exclusiva del Super Usuario. En una sola vista a la altura de
 * la pantalla: los administradores de ventas (con búsqueda por documento) y la auditoría de altas y bajas.
 * Eliminar abre `DeleteAdminModal` para confirmar; un administrador con sesión abierta sí se puede eliminar
 * (el cuadro avisa y su sesión se cierra al borrarlo). En móvil las dos vistas se alternan con pestañas.
 * Solo coordina: los datos vienen de `useAdmins`, `useAdminAuditLog` y `useAdminDeletion`.
 */
const AdminManagement = () => {
  const admins = useAdmins();
  const audit = useAdminAuditLog();
  const search = useDocumentSearch();
  const { toast, notify, close: closeToast } = useToast();
  const [mobileView, setMobileView] = useState('admins');

  const deletion = useAdminDeletion({
    // La auditoría ya la escribió el backend: se vuelve a pedir en vez de adivinar su forma aquí.
    onDeleted: (documentNumber) => {
      admins.removeByDocument(documentNumber);
      audit.reload();
    },
    notify,
  });

  // Mantiene al día el estado de sesión ("Sesión activa" / "Sin sesión") sin recargar la página.
  usePolling(admins.refresh);

  // En móvil solo se ve una de las dos vistas; en escritorio, ambas lado a lado.
  const panelDisplay = (view) => ({ xs: mobileView === view ? 'flex' : 'none', md: 'flex' });

  return (
    <>
      <SplitScreen
        title="Eliminar administrador"
        description="Busca al administrador por su documento y confírmalo antes de eliminarlo. Esta acción no se puede deshacer."
        columns="minmax(0, 1fr) 420px"
        tabs={{
          value: mobileView,
          onChange: setMobileView,
          items: [
            { value: 'admins', label: 'Administradores' },
            { value: 'audit', label: `Auditoría (${audit.entries.length})` },
          ],
        }}
      >
        <AdminListPanel
          admins={search.filter(admins.admins)}
          totalCount={admins.admins.length}
          loading={admins.loading}
          errorMessage={admins.error}
          search={search}
          onDelete={deletion.open}
          sx={{ display: panelDisplay('admins') }}
        />
        <AuditPanel
          title="Auditoría de eliminaciones y creaciones"
          entries={audit.entries}
          emptyMessage="No hay registros de auditoría recientes."
          sx={{ display: panelDisplay('audit') }}
        />
      </SplitScreen>

      <DeleteAdminModal
        open={Boolean(deletion.selected)}
        onClose={deletion.close}
        onConfirm={deletion.confirm}
        adminData={deletion.selected}
        errorMessage={deletion.error}
        isSubmitting={deletion.isDeleting}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </>
  );
};

export default AdminManagement;
