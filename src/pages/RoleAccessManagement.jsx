import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { CircularProgress } from '@mui/material';
import Toast from '../components/Toast';
import {
  getRoleAccessConfigurationErrors,
  hasRoleAccessConfiguration,
  ROLE_ACCESS_CATALOG,
} from '../config/roleAccessCatalog';
import { findCourierByDocumentNumber } from '../services/CourierService';
import { replaceRolePermissions } from '../services/RoleAccessService';
import './RoleAccessManagement.css';

const getPermissionCodes = (role) => new Set(
  role.permissions
    .filter((permission) => permission.editable && permission.defaultGranted)
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

const getSearchError = (error) => {
  if (error.response?.status === 401) {
    return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.';
  }
  if (error.response?.status === 403) {
    return 'No tienes permiso para consultar los mensajeros.';
  }
  return error.response?.data?.message
    || error.message
    || 'No se pudo completar la búsqueda. Inténtalo de nuevo.';
};

const getInitials = (name) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

function RoleAccessManagement() {
  const navigate = useNavigate();
  const [permissionCodesByRole, setPermissionCodesByRole] = useState(() => (
    Object.fromEntries(ROLE_ACCESS_CATALOG.map((role) => [
      role.code,
      getPermissionCodes(role),
    ]))
  ));
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [searchDocument, setSearchDocument] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedCourier, setSearchedCourier] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const rolesWithChanges = ROLE_ACCESS_CATALOG.filter((role) => (
    role.editable
    && !sameSet(permissionCodesByRole[role.code], getPermissionCodes(role))
  ));
  const canSaveChanges = rolesWithChanges.length > 0
    && rolesWithChanges.every(hasRoleAccessConfiguration)
    && !isSavingChanges;

  const handleSearch = async (event) => {
    event.preventDefault();
    const documentNumber = searchDocument.trim();
    if (!/\d/.test(documentNumber)) {
      setSearchedCourier(null);
      setSearchMessage('');
      setSearchError('Ingresa una cédula válida para realizar la búsqueda.');
      return;
    }

    setIsSearching(true);
    setSearchedCourier(null);
    setSearchError('');
    setSearchMessage('');
    try {
      const courier = await findCourierByDocumentNumber(documentNumber);
      if (!courier) {
        setSearchMessage('No se encontró un mensajero con esa cédula.');
        return;
      }
      setSearchedCourier(courier);
    } catch (error) {
      console.error('Error al buscar mensajero para la gestión de roles:', error);
      setSearchError(getSearchError(error));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePermissionToggle = (roleCode, permissionCode) => {
    setPermissionCodesByRole((current) => {
      const next = new Set(current[roleCode]);
      if (next.has(permissionCode)) {
        next.delete(permissionCode);
      } else {
        next.add(permissionCode);
      }
      return { ...current, [roleCode]: next };
    });
  };

  const handleReset = () => {
    setPermissionCodesByRole((current) => Object.fromEntries(
      ROLE_ACCESS_CATALOG.map((role) => [
        role.code,
        role.editable ? getPermissionCodes(role) : current[role.code],
      ])
    ));
  };

  const handleSave = async () => {
    if (!canSaveChanges) return;
    const savedRoleNames = [];
    setIsSavingChanges(true);
    try {
      for (const role of rolesWithChanges) {
        const selectedPermissionCodes = permissionCodesByRole[role.code];
        const permissionIds = role.permissions
          .filter((permission) => (
            permission.editable && selectedPermissionCodes.has(permission.code)
          ))
          .map((permission) => permission.id);

        try {
          const result = await replaceRolePermissions(role.id, permissionIds);
          if (result.role !== role.code || !Array.isArray(result.permissions)) {
            throw new Error('El backend devolvió una respuesta inesperada al guardar permisos.');
          }
          setPermissionCodesByRole((current) => ({
            ...current,
            [role.code]: new Set(result.permissions),
          }));
          savedRoleNames.push(role.name);
        } catch (error) {
          console.error(`Error al guardar la matriz de ${role.name}:`, error);
          const message = savedRoleNames.length > 0
            ? `Se guardaron los cambios de ${savedRoleNames.join(', ')}, pero no se pudo guardar ${role.name}. ${getSaveError(error)}`
            : getSaveError(error);
          setToast({ open: true, severity: 'error', message });
          return;
        }
      }
      setToast({
        open: true,
        severity: 'success',
        message: `Matriz actualizada para: ${savedRoleNames.join(', ')}.`,
      });
    } finally {
      setIsSavingChanges(false);
    }
  };

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

        <section className="access-card user-search-card" aria-labelledby="user-search-title">
          <label className="access-card-label" htmlFor="role-user-search" id="user-search-title">
            USUARIO A CONFIGURAR
          </label>
          <form className="user-search-form" onSubmit={handleSearch}>
            <input
              id="role-user-search"
              type="search"
              value={searchDocument}
              onChange={(event) => setSearchDocument(event.target.value)}
              placeholder="Cédula del usuario · ej. 1-0345-0678"
              aria-describedby="user-search-scope"
              disabled={isSearching}
            />
            <button className="access-primary-button" type="submit" disabled={isSearching}>
              {isSearching
                ? <CircularProgress size={19} color="inherit" />
                : <SearchRounded aria-hidden="true" />}
              {isSearching ? 'Buscando...' : 'Buscar usuario'}
            </button>
          </form>
          <p className="access-search-scope" id="user-search-scope">
            La API disponible permite consultar mensajeros; no hay un endpoint de búsqueda para otros roles.
          </p>
          {searchError && <p className="access-inline-error" role="alert">{searchError}</p>}
          {searchMessage && <p className="access-search-message" role="status">{searchMessage}</p>}
          {searchedCourier && (
            <div className="access-user-preview" role="status">
              <span className="access-user-avatar" aria-hidden="true">
                {getInitials(searchedCourier.fullName)}
              </span>
              <div className="access-user-details">
                <strong>{searchedCourier.fullName}</strong>
                <span>
                  {searchedCourier.documentNumber}
                  {' · rol actual: '}
                  {searchedCourier.role || 'Mensajero'}
                </span>
              </div>
            </div>
          )}
        </section>

        <section className="access-matrix-card" aria-labelledby="access-matrix-title">
          <div className="access-matrix-heading">
            <div>
              <div className="access-matrix-title-row">
                <h2 id="access-matrix-title">Matriz de control de acceso</h2>
              </div>
              <p>Permisos organizados por perfil: Super Usuario, Administrador de Ventas y Mensajero.</p>
            </div>
            <div className="access-matrix-actions">
              <button
                className="access-secondary-button"
                type="button"
                onClick={handleReset}
                disabled={rolesWithChanges.length === 0 || isSavingChanges}
              >
                <RestartAltRounded aria-hidden="true" />
                Restablecer predeterminados
              </button>
              <button
                className="access-primary-button"
                type="button"
                onClick={handleSave}
                disabled={!canSaveChanges}
              >
                {isSavingChanges
                  ? <CircularProgress size={19} color="inherit" />
                  : <SaveOutlined aria-hidden="true" />}
                Aplicar cambios
              </button>
            </div>
          </div>

          {ROLE_ACCESS_CATALOG.map((role) => {
            const selectedPermissionCodes = permissionCodesByRole[role.code];
            const configurationErrors = getRoleAccessConfigurationErrors(role);

            return (
              <section className="access-role-section" key={role.code}>
                <div className="access-group-heading">
                  <span aria-hidden="true" />
                  <h3>{role.name}</h3>
                  <span className="access-group-count">{role.permissions.length} permisos</span>
                  {!role.editable && (
                    <span className="access-fixed-label">
                      <LockOutlined aria-hidden="true" />
                      Fijos
                    </span>
                  )}
                </div>

                {role.permissions.map((permission) => {
                  const isSelected = permission.editable
                    ? selectedPermissionCodes.has(permission.code)
                    : permission.defaultGranted;

                  return (
                    <div
                      className={`access-permission-row${permission.editable ? '' : ' is-fixed'}`}
                      key={permission.code}
                    >
                      <span className="access-permission-name">{permission.description}</span>
                      <button
                        className={`access-toggle${isSelected ? ' is-on' : ''}${permission.editable ? '' : ' is-disabled'}`}
                        type="button"
                        role="switch"
                        aria-checked={isSelected}
                        aria-label={`${permission.description}: ${isSelected ? 'permitido' : 'denegado'}${permission.editable ? '' : ', no editable'}`}
                        onClick={() => handlePermissionToggle(role.code, permission.code)}
                        disabled={!permission.editable || isSavingChanges}
                      >
                        <span>{isSelected && <CheckRounded aria-hidden="true" />}</span>
                      </button>
                    </div>
                  );
                })}

                {configurationErrors.length > 0 && (
                  <p className="access-role-configuration" role="status">
                    Guardado no disponible: configura {configurationErrors.join(', ')}.
                  </p>
                )}
              </section>
            );
          })}
        </section>

        <aside className="access-security-note">
          <p>
            El backend actual solo permite guardar los permisos operativos habilitados para
            Administrador de Ventas y Mensajero. Los permisos fijos de Super Usuario y los
            renglones aún no soportados por la API se muestran sin edición. Guardar reemplaza
            la matriz completa del rol para todas las cuentas que lo tienen; no cambia el rol
            individual de una persona.
          </p>
        </aside>
      </div>
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
