import { useState } from 'react';
import PageHeaderBar from '../components/PageHeaderBar';
import PageContainer from '../components/PageContainer';
import CheckRounded from '@mui/icons-material/CheckRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import RestartAltRounded from '@mui/icons-material/RestartAltRounded';
import SaveOutlined from '@mui/icons-material/SaveOutlined';
import SearchRounded from '@mui/icons-material/SearchRounded';
import { CircularProgress } from '@mui/material';
import Toast from '../components/Toast';
import { ROLE_ACCESS_CATALOG } from '../config/roleAccessCatalog';
import {
  getUserPermissions,
  replaceUserPermissions,
  resetUserPermissions,
} from '../services/RoleAccessService';
import './RoleAccessManagement.css';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'DIMEX', label: 'DIMEX' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const DOCUMENT_PLACEHOLDERS = {
  CEDULA: 'Ej. 1-2345-6789',
  DIMEX: 'Ej. 155812345678',
  PASAPORTE: 'Ej. A12345678',
};

const sameSet = (left, right) => (
  left.size === right.size && [...left].every((value) => right.has(value))
);

const getInitials = (name) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

// El backend responde en inglés para los errores de alcance; 404 trae "Usuario no existente".
const getRequestError = (error, fallback) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.';
  if (status === 403) {
    return 'No tienes permiso para modificar los permisos de este usuario, o su rol no admite cambios.';
  }
  if (status === 404) return error.response?.data?.message || 'Usuario no existente';
  if (status === 400) return 'Revisa el tipo y el número de documento ingresados.';
  return error.message || fallback;
};

/**
 * Pantalla "Roles y permisos" (HU-009), exclusiva del Super Usuario: busca un mensajero por número de
 * documento y muestra la matriz de control de acceso por perfil (Super Usuario, Administrador de
 * Ventas y Mensajero). "Aplicar cambios" envía los permisos editados de cada rol a
 * `PUT /api/v1/roles/{roleId}/permissions`; "Restablecer predeterminados" vuelve a los valores del
 * catálogo del frontend.
 */
function RoleAccessManagement() {
  const [documentType, setDocumentType] = useState('CEDULA');
  const [documentNumber, setDocumentNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedCodes, setSelectedCodes] = useState(() => new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const appliedCodes = new Set(user?.effectivePermissions ?? []);
  const hasChanges = user !== null && !sameSet(selectedCodes, appliedCodes);
  const roleGroup = user
    ? ROLE_ACCESS_CATALOG.find((role) => role.code === user.role)
    : null;

  const showUser = (permissions) => {
    setUser(permissions);
    setSelectedCodes(new Set(permissions.effectivePermissions));
    setSaveError('');
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    const number = documentNumber.trim();
    if (!number) {
      setUser(null);
      setSearchError('Ingresa el número de documento del usuario.');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setUser(null);
    try {
      showUser(await getUserPermissions(documentType, number));
    } catch (error) {
      setSearchError(getRequestError(error, 'No se pudo completar la búsqueda. Inténtalo de nuevo.'));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePermissionToggle = (code) => {
    setSelectedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const applyResult = async (request, successMessage, failureMessage) => {
    setIsSaving(true);
    setSaveError('');
    try {
      showUser(await request());
      setToast({ open: true, severity: 'success', message: successMessage });
    } catch (error) {
      const message = getRequestError(error, failureMessage);
      setSaveError(message);
      setToast({ open: true, severity: 'error', message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = () => {
    if (!hasChanges || isSaving) return;
    applyResult(
      () => replaceUserPermissions(user.documentType, user.documentNumber, [...selectedCodes]),
      'Los permisos se aplicarán en la siguiente solicitud del usuario.',
      'No se pudo guardar los cambios.'
    );
  };

  // Vuelve a los permisos predeterminados del rol principal del usuario.
  const handleReset = () => {
    if (isSaving) return;
    if (!user.customized) {
      setSelectedCodes(new Set(user.effectivePermissions));
      return;
    }
    applyResult(
      () => resetUserPermissions(user.documentType, user.documentNumber),
      'Se restablecieron los permisos predeterminados del rol.',
      'No se pudo restablecer los permisos.'
    );
  };

  const canReset = user !== null && user.editable && (user.customized || hasChanges);

  return (
    <>
      <PageHeaderBar
        title="Roles y permisos"
        description="Busca a un usuario y ajusta qué puede hacer dentro del sistema."
      />

      <PageContainer component="main">

        <section className="access-card user-search-card" aria-labelledby="user-search-title">
          <label className="access-card-label" htmlFor="role-user-search" id="user-search-title">
            USUARIO A CONFIGURAR
          </label>
          <form className="user-search-form" onSubmit={handleSearch}>
            <select
              aria-label="Tipo de documento"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              disabled={isSearching}
            >
              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <input
              id="role-user-search"
              type="search"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              placeholder={DOCUMENT_PLACEHOLDERS[documentType]}
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
            Busca al usuario por su documento (cédula, DIMEX o pasaporte), sea cual sea su rol.
          </p>
          {searchError && <p className="access-inline-error" role="alert">{searchError}</p>}
          {user && (
            <div className="access-user-preview" role="status">
              <span className="access-user-avatar" aria-hidden="true">
                {getInitials(user.fullName)}
              </span>
              <div className="access-user-details">
                <strong>{user.fullName}</strong>
                <span>
                  {user.documentNumber}
                  {' · rol principal: '}
                  {roleGroup?.name ?? user.role}
                  {user.customized ? ' · permisos personalizados' : ''}
                </span>
              </div>
            </div>
          )}
        </section>

        {user && (
          <section className="access-matrix-card" aria-labelledby="access-matrix-title">
            <div className="access-matrix-heading">
              <div>
                <div className="access-matrix-title-row">
                  <h2 id="access-matrix-title">Matriz de control de acceso</h2>
                </div>
                <p>
                  Permisos de {user.fullName}. Solo se pueden modificar los permisos que
                  corresponden a su rol.
                </p>
              </div>
              <div className="access-matrix-actions">
                <button
                  className="access-secondary-button"
                  type="button"
                  onClick={handleReset}
                  disabled={!canReset || isSaving}
                >
                  <RestartAltRounded aria-hidden="true" />
                  Restablecer predeterminados
                </button>
                <button
                  className="access-primary-button"
                  type="button"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving
                    ? <CircularProgress size={19} color="inherit" />
                    : <SaveOutlined aria-hidden="true" />}
                  {isSaving ? 'Guardando...' : 'Aplicar cambios'}
                </button>
              </div>
            </div>

            {saveError && (
              <p className="access-inline-error" role="alert" style={{ marginTop: '1rem' }}>
                {saveError}
              </p>
            )}

            {roleGroup && (
              <section className="access-role-section">
                <div className="access-group-heading">
                  <span aria-hidden="true" />
                  <h3>{roleGroup.name}</h3>
                  <span className="access-group-count">{roleGroup.permissions.length} permisos</span>
                  {!user.editable && (
                    <span className="access-fixed-label">
                      <LockOutlined aria-hidden="true" />
                      Fijos
                    </span>
                  )}
                </div>

                {roleGroup.permissions.map((permission) => {
                  const isEditable = user.editable && user.allowedPermissions.includes(permission.code);
                  const isSelected = isEditable
                    ? selectedCodes.has(permission.code)
                    : permission.defaultGranted;

                  return (
                    <div
                      className={`access-permission-row${isEditable ? '' : ' is-fixed'}`}
                      key={permission.code}
                    >
                      <span className="access-permission-name">{permission.description}</span>
                      <button
                        className={`access-toggle${isSelected ? ' is-on' : ''}${isEditable ? '' : ' is-disabled'}`}
                        type="button"
                        role="switch"
                        aria-checked={isSelected}
                        aria-label={`${permission.description}: ${isSelected ? 'permitido' : 'denegado'}${isEditable ? '' : ', no editable'}`}
                        onClick={() => handlePermissionToggle(permission.code)}
                        disabled={!isEditable}
                      >
                        <span>{isSelected && <CheckRounded aria-hidden="true" />}</span>
                      </button>
                    </div>
                  );
                })}
              </section>
            )}
          </section>
        )}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </PageContainer>
    </>
  );
}

export default RoleAccessManagement;
