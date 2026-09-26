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
  ROLE_ACCESS_CATALOG,
} from '../config/roleAccessCatalog';
import { findCourierByDocumentNumber } from '../services/CourierService';
import './RoleAccessManagement.css';

const getPermissionCodes = (role) => new Set(
  role.permissions
    .filter((permission) => permission.editable && permission.defaultGranted)
    .map((permission) => permission.code)
);

const sameSet = (left, right) => (
  left.size === right.size && [...left].every((value) => right.has(value))
);

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

const getDefaultPermissionCodesByRole = () => Object.fromEntries(
  ROLE_ACCESS_CATALOG.map((role) => [role.code, getPermissionCodes(role)])
);

const copyPermissionCodesByRole = (permissionsByRole) => Object.fromEntries(
  Object.entries(permissionsByRole).map(([roleCode, codes]) => [
    roleCode,
    new Set(codes),
  ])
);

function RoleAccessManagement() {
  const navigate = useNavigate();
  const [defaultPermissionCodesByRole] = useState(getDefaultPermissionCodesByRole);
  const [permissionCodesByRole, setPermissionCodesByRole] = useState(
    () => copyPermissionCodesByRole(defaultPermissionCodesByRole)
  );
  const [appliedPermissionCodesByRole, setAppliedPermissionCodesByRole] = useState(
    () => copyPermissionCodesByRole(defaultPermissionCodesByRole)
  );
  const [searchDocument, setSearchDocument] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchedCourier, setSearchedCourier] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const hasChanges = ROLE_ACCESS_CATALOG.some((role) => (
    role.editable
    && !sameSet(
      permissionCodesByRole[role.code],
      appliedPermissionCodesByRole[role.code]
    )
  ));

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
        role.editable
          ? new Set(defaultPermissionCodesByRole[role.code])
          : current[role.code],
      ])
    ));
  };

  const handleSave = () => {
    if (!hasChanges) return;
    setAppliedPermissionCodesByRole(copyPermissionCodesByRole(permissionCodesByRole));
    setToast({ open: true, severity: 'success', message: 'Cambios aplicados.' });
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
            Busca al usuario mediante su cédula.
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
                disabled={!hasChanges}
              >
                <RestartAltRounded aria-hidden="true" />
                Restablecer predeterminados
              </button>
              <button
                className="access-primary-button"
                type="button"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <SaveOutlined aria-hidden="true" />
                Aplicar cambios
              </button>
            </div>
          </div>

          {ROLE_ACCESS_CATALOG.map((role) => {
            const selectedPermissionCodes = permissionCodesByRole[role.code];

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
                        disabled={!permission.editable}
                      >
                        <span>{isSelected && <CheckRounded aria-hidden="true" />}</span>
                      </button>
                    </div>
                  );
                })}

              </section>
            );
          })}
        </section>
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
