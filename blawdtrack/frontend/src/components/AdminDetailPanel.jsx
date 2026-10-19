import AccountDetailPanel from './AccountDetailPanel';
import AdminEditForm from './AdminEditForm';
import { getAdminDocument, getAdminName } from '../utils/adminEdit';

/**
 * Panel de un administrador (HU-007): quién es, y dos pestañas, "Datos" (formulario) e "Historial" (solo los cambios de
 * ese administrador). Equivale a `CourierDetailPanel`; el diseño vive en `AccountDetailPanel`. Hay que montarlo con
 * `key` distinto por administrador para que vuelva a la pestaña de datos al cambiar de uno a otro.
 * @param {{ editor: ReturnType<typeof import('../hooks/useAdminEditor').useAdminEditor>, onBack: Function,
 *   onDiscard: Function, listOpen: boolean, onShowList: Function }} props
 */
export default function AdminDetailPanel({ editor, onBack, onDiscard, listOpen, onShowList }) {
  const { admin, history } = editor;

  return (
    <AccountDetailPanel
      name={getAdminName(admin)}
      subtitle={`${admin.documentType} ${getAdminDocument(admin)} · no editable`}
      active={editor.formData.status === 'ACTIVE'}
      history={history}
      emptyHistoryMessage="Todavía no hay cambios registrados para este administrador."
      showListLabel="Mostrar lista"
      form={<AdminEditForm editor={editor} onDiscard={onDiscard} />}
      onBack={onBack}
      listOpen={listOpen}
      onShowList={onShowList}
    />
  );
}
