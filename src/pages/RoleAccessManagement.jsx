import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import CheckRounded from '@mui/icons-material/CheckRounded';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SecurityOutlined from '@mui/icons-material/SecurityOutlined';
import { BottomNavigation, BottomNavigationAction, CircularProgress } from '@mui/material';
import Toast from '../components/Toast';
import {
  hasRoleAccessConfiguration,
  PERMISSION_GROUPS,
  ROLE_ACCESS_CATALOG,
} from '../config/roleAccessCatalog';
import { replaceRolePermissions } from '../services/RoleAccessService';
import './RoleAccessManagement.css';

const getPermissionCodes = (role) => new Set(
  role.permissions.filter((permission) => permission.defaultGranted)
    .map((permission) => permission.code)
);

const sameSet = (left, right) => (
  left.size === right.size && [...left].every((value) => right.has(value))
);

const getSaveError = (error) => {
  if (error.response?.status === 400) {
    return 'El backend rechazó los IDs de permisos enviados. Verifica la configuración del catálogo.';
  }
  if (error.response?.status === 403) {
    return 'No tienes permiso para modificar la matriz de este rol.';
  }
  if (error.response?.status === 404) {
    return 'No se encontró el rol o uno de sus permisos configurados.';
  }
  if (error.response?.status === 401) {
    return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.';
  }
  return error.response?.data?.message
    || 'No se pudieron aplicar los cambios. Inténtalo de nuevo.';
};

function RoleAccessManagement() {
  const navigate = useNavigate();
  const [selectedRoleCode, setSelectedRoleCode] = useState(ROLE_ACCESS_CATALOG[0].code);
  const [permissionsByRole, setPermissionsByRole] = useState(() => (
    Object.fromEntries(ROLE_ACCESS_CATALOG.map((role) => [
      role.code,
      getPermissionCodes(role),
    ]))
  ));
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const selectedRole = useMemo(
    () => ROLE_ACCESS_CATALOG.find((role) => role.code === selectedRoleCode),
    [selectedRoleCode]
  );
  const selectedPermissionCodes = permissionsByRole[selectedRoleCode];
  const originalPermissionCodes = getPermissionCodes(selectedRole);
  const hasChanges = !sameSet(selectedPermissionCodes, originalPermissionCodes);
  const canSave = hasRoleAccessConfiguration(selectedRole);
  const permissionGroups = PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: selectedRole.permissions.filter(
      (permission) => permission.group === group.id
    ),
  })).filter((group) => group.permissions.length > 0);

  const handlePermissionToggle = (permissionCode) => {
    setPermissionsByRole((current) => {
      const next = new Set(current[selectedRoleCode]);
      if (next.has(permissionCode)) {
        next.delete(permissionCode);
      } else {
        next.add(permissionCode);
      }
      return { ...current, [selectedRoleCode]: next };
    });
  };

  const handleReset = () => {
    setPermissionsByRole((current) => ({
      ...current,
      [selectedRoleCode]: getPermissionCodes(selectedRole),
    }));
  };

  const handleSave = async () => {
    if (!canSave || !hasChanges || isSaving) return;

    const permissionIds = selectedRole.permissions
      .filter((permission) => selectedPermissionCodes.has(permission.code))
      .map((permission) => permission.id);

    setIsSaving(true);
    try {
      const result = await replaceRolePermissions(selectedRole.id, permissionIds);
      if (result.role !== selectedRole.code || !Array.isArray(result.permissions)) {
        throw new Error('El backend devolvió una respuesta inesperada al guardar permisos.');
      }
      const savedCodes = new Set(result.permissions);
      setPermissionsByRole((current) => ({
        ...current,
        [selectedRoleCode]: savedCodes,
      }));
      setToast({
        open: true,
        severity: 'success',
        message: `Matriz de ${selectedRole.name} actualizada para todas las cuentas con este rol.`,
      });
    } catch (error) {
      console.error('Error al guardar la matriz de permisos:', error);
      setToast({ open: true, severity: 'error', message: getSaveError(error) });
    } finally {
      setIsSaving(false);
    }
  };

  const missingConfiguration = [];
  if (!selectedRole.id) missingConfiguration.push('el ID del rol');
  if (!selectedRole.permissions.every((permission) => permission.id)) {
    missingConfiguration.push('los IDs de sus permisos');
  }
  if (!selectedRole.currentPermissionsConfigured) {
    missingConfiguration.push('los permisos actuales del rol');
  }

  return (
    <main className="role-access-page">
      <div className="role-access-shell">
        <button
          className="access-back-button"
          type="button"
          onClick={() => navigate('/administradores')}
        >
          <ArrowBackRounded aria-hidden="true" />
          Volver a administración
        </button>

        <header className="access-page-heading">
          <div className="access-heading-icon" aria-hidden="true">
            <SecurityOutlined />
          </div>
          <div>
            <span className="access-eyebrow">SEGURIDAD Y ACCESOS</span>
            <h1>Gestionamiento de roles</h1>
            <p>Configura los permisos disponibles para cada perfil del sistema.</p>
          </div>
        </header>

        <section className="access-card user-search-card" aria-labelledby="role-picker-title">
          <div className="access-card-label" id="role-picker-title">ROL A CONFIGURAR</div>
          <div className="access-role-picker" aria-label="Seleccionar rol">
            {ROLE_ACCESS_CATALOG.map((role) => (
              <button
                className={`access-role-chip${role.code === selectedRoleCode ? ' is-selected' : ''}`}
                key={role.code}
                type="button"
                onClick={() => setSelectedRoleCode(role.code)}
                aria-pressed={role.code === selectedRoleCode}
              >
                {role.name}
              </button>
            ))}
          </div>
        </section>

        <section className="access-card access-matrix-card" aria-labelledby="access-matrix-title">
          <div className="access-matrix-heading">
            <div>
              <div className="access-matrix-title-row">
                <SecurityOutlined aria-hidden="true" />
                <h2 id="access-matrix-title">Matriz de control de acceso</h2>
              </div>
              <p>Permisos configurables para {selectedRole.name}.</p>
            </div>
            <div className="access-matrix-actions">
              <button
                className="access-secondary-button"
                type="button"
                onClick={handleReset}
                disabled={isSaving}
              >
                <RestartAltRounded aria-hidden="true" />
                Restablecer predeterminados
              </button>
              <button
                className="access-primary-button"
                type="button"
                onClick={handleSave}
                disabled={!canSave || !hasChanges || isSaving}
              >
                {isSaving
                  ? <CircularProgress size={19} color="inherit" />
                  : <SaveOutlined aria-hidden="true" />}
                Aplicar cambios
              </button>
            </div>
          </div>

          {permissionGroups.map((group) => (
            <section className="access-permission-group" key={group.id}>
              <div className={`access-group-heading access-group-${group.id}`}>
                <span aria-hidden="true" />
                <h3>{group.title}</h3>
                <span className="access-group-count">{group.permissions.length} permisos</span>
              </div>
              {group.permissions.map((permission) => {
                const isSelected = selectedPermissionCodes.has(permission.code);
                return (
                  <div className="access-permission-row" key={permission.code}>
                    <div className="access-permission-name">
                      <span>{permission.description}</span>
                    </div>
                    <button
                      className={`access-toggle${isSelected ? ' is-on' : ''}`}
                      type="button"
                      role="switch"
                      aria-checked={isSelected}
                      aria-label={`${permission.description}: ${isSelected ? 'permitido' : 'denegado'}`}
                      onClick={() => handlePermissionToggle(permission.code)}
                    >
                      <span>{isSelected && <CheckRounded aria-hidden="true" />}</span>
                    </button>
                  </div>
                );
              })}
            </section>
          ))}
        </section>

        {!canSave && (
          <aside className="access-inline-error" role="status">
            No existe un GET para obtener los IDs ni los permisos actuales. Para habilitar el
            guardado configura {missingConfiguration.join(', ')} en el entorno frontend.
          </aside>
        )}

        <aside className="access-security-note">
          <SecurityOutlined aria-hidden="true" />
          <p>
            El guardado reemplaza la matriz completa del rol {selectedRole.name} en
            `roles_permisos`, por lo que afecta a todas las cuentas que lo tienen.
            El backend solo acepta los permisos mostrados; cualquier otro permiso
            asociado al rol se eliminará. No cambia roles individuales por cédula.
          </p>
        </aside>
      </div>
      <nav className="role-access-mobile-nav" aria-label="Navegación principal">
        <BottomNavigation
          showLabels
          value="/gestion-roles"
          onChange={(_, value) => navigate(value)}
        >
          <BottomNavigationAction label="Acceso" value="/administradores" icon={<AdminPanelSettingsOutlined />} />
          <BottomNavigationAction label="Mensajeros" value="/mensajeros" icon={<LocalShippingOutlined />} />
          <BottomNavigationAction label="Admins" value="/administradores" icon={<GroupsOutlined />} />
          <BottomNavigationAction label="Permisos" value="/gestion-roles" icon={<SecurityOutlined />} />
        </BottomNavigation>
      </nav>
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </main>
  );
}

export default RoleAccessManagement;
