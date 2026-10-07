import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import EmptyState from '../components/EmptyState';
import PermissionMatrixPanel from '../components/PermissionMatrixPanel';
import SplitScreen from '../components/SplitScreen';
import Toast from '../components/Toast';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import UserLookupPanel from '../components/UserLookupPanel';
import { ROLE_ACCESS_CATALOG } from '../config/roleAccessCatalog';
import { useToast } from '../hooks/useToast';
import { useUserLookup } from '../hooks/useUserLookup';
import { useUserPermissions } from '../hooks/useUserPermissions';

/**
 * Pantalla "Roles y permisos" (HU-009), exclusiva del Super Usuario: a la izquierda se busca al usuario por
 * documento y a la derecha se ajustan sus permisos. Solo coordina las piezas: la búsqueda
 * (`useUserLookup`), los permisos (`useUserPermissions`), los avisos (`useToast`) y la protección de cambios
 * sin guardar.
 */
function RoleAccessManagement() {
  const { toast, notify, close } = useToast();
  const permissions = useUserPermissions(notify);
  const lookup = useUserLookup(permissions.find);
  const { user } = permissions;
  const roleGroup = user ? ROLE_ACCESS_CATALOG.find((role) => role.code === user.role) : null;

  return (
    <>
      <UnsavedChangesGuard when={permissions.hasChanges} />
      <SplitScreen
        title="Roles y permisos"
        description="Busca a un usuario y ajusta qué puede hacer dentro del sistema."
        columns="420px minmax(0, 1fr)"
      >
        <UserLookupPanel
          search={lookup}
          error={permissions.searchError}
          user={user}
          roleName={roleGroup?.name}
          busy={permissions.searching}
        />
        {user ? (
          <PermissionMatrixPanel
            user={user}
            roleGroup={roleGroup}
            selected={permissions.selected}
            onToggle={permissions.toggle}
            onSave={permissions.save}
            onReset={permissions.reset}
            saving={permissions.saving}
            hasChanges={permissions.hasChanges}
            canReset={permissions.canReset}
            error={permissions.saveError}
          />
        ) : (
          <EmptyState
            icon={ManageAccountsOutlined}
            title="Busca a un usuario"
            description="Ingresa su documento para ver y ajustar sus permisos."
          />
        )}
      </SplitScreen>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={close} />
    </>
  );
}

export default RoleAccessManagement;
