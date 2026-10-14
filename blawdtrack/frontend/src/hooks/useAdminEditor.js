import { useCallback, useState } from 'react';
import { getAdministrator, updateAdministrator } from '../services/AdminService';
import { normalizeAdminUpdateError } from '../utils/adminErrors';
import {
  EMPTY_ADMIN_FORM,
  adminToFormValues,
  diffAdminForm,
  getAdminDocument,
  isFormDirty,
  validateAdminEditForm,
} from '../utils/adminEdit';

const SAVED_MESSAGE = 'Actualización exitosa. Los datos del administrador han sido modificados.';
const SESSION_CLOSED_NOTE = ' Su sesión activa se cerró.';
const SESSION_WARNING =
  'Cambio en el estado de acceso: la sesión activa del administrador se cerrará de inmediato al guardar.';

/**
 * Edición de un administrador (HU-007): cuál está seleccionado, su formulario, la validación y el guardado.
 * Elegirlo vuelve a consultar al backend (`GET`) para confirmar que existe y traer sus datos actuales; guardar es una
 * sola llamada (`PATCH`) con los campos que cambiaron. Equivale a `useCourierEditor`, con una llamada en lugar de tres.
 *
 * @param {{ notify: (message: string, severity?: string) => void, onSaved: (admin: object) => void,
 *   onGone: (admin: object) => void }} options `notify` muestra avisos; `onSaved` recibe el administrador actualizado;
 *   `onGone` avisa que el administrador ya no existe (para volver a cargar la lista).
 */
export function useAdminEditor({ notify, onSaved, onGone }) {
  const [admin, setAdmin] = useState(null);
  const [formData, setFormData] = useState(EMPTY_ADMIN_FORM);
  const [initialValues, setInitialValues] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [updateError, setUpdateError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** Deja de editar: sin administrador y sin formulario. */
  const clear = useCallback(() => {
    setAdmin(null);
    setInitialValues(null);
    setFormData(EMPTY_ADMIN_FORM);
    setFormErrors({});
    setUpdateError(null);
  }, []);

  /**
   * Elige a un administrador de la lista: consulta su perfil actual y carga el formulario. Si ya no existe, avisa y
   * deja la lista para que se vuelva a cargar.
   * @returns {Promise<boolean>} `true` si quedó seleccionado.
   */
  const select = useCallback(async (listed) => {
    setLoading(true);
    try {
      const profile = await getAdministrator(listed.documentType, getAdminDocument(listed));
      const values = adminToFormValues(profile);
      setAdmin(profile);
      setFormData(values);
      setInitialValues(values);
      setFormErrors({});
      setUpdateError(null);
      return true;
    } catch (error) {
      const normalized = normalizeAdminUpdateError(error);
      notify(normalized.globalMessage, normalized.severity);
      if (normalized.kind === 'notFound') onGone(listed);
      return false;
    } finally {
      setLoading(false);
    }
  }, [notify, onGone]);

  const change = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (formErrors[name]) setFormErrors((previous) => ({ ...previous, [name]: null }));
  };

  const toggleStatus = () => {
    if (!admin) return;
    const nextStatus = formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setFormData((previous) => ({ ...previous, status: nextStatus }));
    // Cualquier cambio del estado de acceso cierra la sesión activa de inmediato (lo hace el backend al guardar).
    if (nextStatus !== initialValues.status) notify(SESSION_WARNING, 'warning');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!admin || submitting) return;

    const errors = validateAdminEditForm(formData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      notify('Por favor corrija los errores en el formulario antes de guardar.', 'error');
      return;
    }

    setUpdateError(null);
    const { changes, hasChanges, closesSession } = diffAdminForm(formData, initialValues);
    if (!hasChanges) {
      notify('No se detectaron cambios en la información del administrador.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await updateAdministrator(admin.documentType, getAdminDocument(admin), changes);
      onSaved(updated);
      clear();
      notify(`${SAVED_MESSAGE}${closesSession ? SESSION_CLOSED_NOTE : ''}`, 'success');
    } catch (error) {
      const normalized = normalizeAdminUpdateError(error);
      setFormErrors(normalized.fieldErrors);
      setUpdateError(normalized.globalMessage);
      // Un error de campo (por ejemplo el correo repetido) ya se ve en su campo; igual se avisa arriba.
      notify(normalized.globalMessage || 'Revisa los campos marcados e intenta de nuevo.', normalized.severity);
      if (normalized.kind === 'notFound') {
        clear();
        onGone(admin);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    admin,
    formData,
    formErrors,
    updateError,
    loading,
    submitting,
    isDirty: Boolean(admin) && isFormDirty(formData, initialValues),
    select,
    clear,
    change,
    toggleStatus,
    submit,
  };
}

export default useAdminEditor;
