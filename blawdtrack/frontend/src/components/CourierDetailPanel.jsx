import AccountDetailPanel from './AccountDetailPanel';
import CourierEditForm from './CourierEditForm';
import { getCourierDocument, getCourierName } from '../utils/courierEdit';

/**
 * Panel de un mensajero: quién es, y dos pestañas, "Datos" (formulario) e "Historial" (solo los cambios de ese
 * mensajero). El diseño vive en `AccountDetailPanel`. Hay que montarlo con `key` distinto por mensajero para que
 * vuelva a la pestaña de datos al cambiar de uno a otro.
 * @param {{ editor: ReturnType<typeof import('../hooks/useCourierEditor').useCourierEditor>,
 *   onBack: Function, onDiscard: Function, listOpen: boolean, onShowList: Function }} props
 */
export default function CourierDetailPanel({ editor, onBack, onDiscard, listOpen, onShowList }) {
  const { courier, history } = editor;

  return (
    <AccountDetailPanel
      name={getCourierName(courier)}
      subtitle={`Cédula ${getCourierDocument(courier)} · no editable`}
      active={editor.formData.status === 'ACTIVE'}
      history={history}
      emptyHistoryMessage="Todavía no hay cambios registrados para esta pantalla."
      showListLabel="Mostrar flota"
      form={<CourierEditForm editor={editor} onDiscard={onDiscard} />}
      onBack={onBack}
      listOpen={listOpen}
      onShowList={onShowList}
    />
  );
}
