import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import { Box } from '@mui/material';
import ConfirmLeaveDialog from '../components/ConfirmLeaveDialog';
import EmptyState from '../components/EmptyState';
import PermissionMatrixPanel from '../components/PermissionMatrixPanel';
import SplitScreen from '../components/SplitScreen';
import Toast from '../components/Toast';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import UserLookupPanel from '../components/UserLookupPanel';
import { ROLE_ACCESS_CATALOG } from '../config/roleAccessCatalog';
import { useConfirmLeave } from '../hooks/useConfirmLeave';
import { useToast } from '../hooks/useToast';
import { useUserLookup } from '../hooks/useUserLookup';
import { useUserPermissions } from '../hooks/useUserPermissions';

/**
 * Pantalla "Roles y permisos" (HU-009), exclusiva del Super Usuario: arriba se busca al usuario por documento
 * y debajo se ajustan sus permisos. Solo coordina las piezas: la búsqueda
 * (`useUserLookup`), los permisos (`useUserPermissions`), los avisos (`useToast`) y la protección de cambios
 * sin guardar.
 */
function RoleAccessManagement() {
  const { toast, notify, close } = useToast();
  const permissions = useUserPermissions(notify);
  const { user } = permissions;
  const { runOrConfirmLeave, dialogProps } = useConfirmLeave(permissions.hasChanges);

  // Pide confirmación si hay cambios sin aplicar antes de cambiar de usuario o descartar.
  const lookup = useUserLookup((type, number) => runOrConfirmLeave(() => permissions.find(type, number)));
  const discard = () => runOrConfirmLeave(() => {
    permissions.clear();
    lookup.clear();
  });
  const roleGroup = user ? ROLE_ACCESS_CATALOG.find((role) => role.code === user.role) : null;

  return (
    <>
      <UnsavedChangesGuard when={permissions.hasChanges} />
      <SplitScreen
        title="Roles y permisos"
        description="Busca a un usuario y ajusta qué puede hacer dentro del sistema."
        columns="minmax(0, 1fr)"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minHeight: 0 }}>
          <UserLookupPanel
            search={lookup}
            error={permissions.searchError}
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
              onDiscard={discard}
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
              sx={{ flex: 1 }}
            />
          )}
        </Box>
      </SplitScreen>
      <ConfirmLeaveDialog {...dialogProps} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={close} />
    </>
  );
}

export default RoleAccessManagement;
