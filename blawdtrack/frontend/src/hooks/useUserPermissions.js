import { useState } from 'react';
import {
  getUserPermissions,
  replaceUserPermissions,
  resetUserPermissions,
} from '../services/RoleAccessService';
import { getRequestError, sameSet } from '../utils/roleAccess';

/**
 * Permisos de un usuario (HU-009): lo busca por documento, guarda los permisos que se marcan y los
 * restablece a los del rol. `selected` es el conjunto que se está editando; `hasChanges` dice si difiere de
 * lo aplicado.
 * @param {(message: string, severity?: string) => void} notify Muestra un aviso flotante.
 */
export function useUserPermissions(notify) {
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const hasChanges = user !== null && !sameSet(selected, new Set(user.effectivePermissions));
  const canReset = user !== null && user.editable && (user.customized || hasChanges);

  const show = (permissions) => {
    setUser(permissions);
    setSelected(new Set(permissions.effectivePermissions));
    setSaveError('');
  };

  const find = async (documentType, documentNumber) => {
    const number = documentNumber.trim();
    if (!number) {
      setUser(null);
      setSearchError('Ingresa el número de documento del usuario.');
      return;
    }
    setSearching(true);
    setSearchError('');
    setUser(null);
    try {
      show(await getUserPermissions(documentType, number));
    } catch (error) {
      setSearchError(getRequestError(error, 'No se pudo completar la búsqueda. Inténtalo de nuevo.'));
    } finally {
      setSearching(false);
    }
  };

  const toggle = (code) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const apply = async (request, successMessage, failureMessage) => {
    setSaving(true);
    setSaveError('');
    try {
      show(await request());
      notify(successMessage);
    } catch (error) {
      const message = getRequestError(error, failureMessage);
      setSaveError(message);
      notify(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!hasChanges || saving) return;
    apply(
      () => replaceUserPermissions(user.documentType, user.documentNumber, [...selected]),
      'Los permisos se aplicarán en la siguiente solicitud del usuario.',
      'No se pudo guardar los cambios.'
    );
  };

  // Sin excepciones guardadas solo se descartan los cambios en pantalla; con excepciones se borran en el servidor.
  const reset = () => {
    if (saving) return;
    if (!user.customized) {
      setSelected(new Set(user.effectivePermissions));
      return;
    }
    apply(
      () => resetUserPermissions(user.documentType, user.documentNumber),
      'Se restablecieron los permisos predeterminados del rol.',
      'No se pudo restablecer los permisos.'
    );
  };

  return {
    user, selected, searching, searchError, saving, saveError,
    hasChanges, canReset, find, toggle, save, reset,
  };
}
