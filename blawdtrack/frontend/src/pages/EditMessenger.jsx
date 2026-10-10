import { useEffect, useRef, useState } from 'react';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import ConfirmLeaveDialog from '../components/ConfirmLeaveDialog';
import CourierDetailPanel from '../components/CourierDetailPanel';
import CourierFleetPanel from '../components/CourierFleetPanel';
import CourierGeneralHistoryPanel from '../components/CourierGeneralHistoryPanel';
import EmptyState from '../components/EmptyState';
import SplitScreen from '../components/SplitScreen';
import Toast from '../components/Toast';
import UnsavedChangesGuard from '../components/UnsavedChangesGuard';
import { useConfirmLeave } from '../hooks/useConfirmLeave';
import { useCourierEditor } from '../hooks/useCourierEditor';
import { useCourierFleet } from '../hooks/useCourierFleet';
import { useCourierGeneralHistory } from '../hooks/useCourierHistory';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { useToast } from '../hooks/useToast';
import { getCourierDocument, getCourierName } from '../utils/courierEdit';
import { rem } from '../theme';

// Normaliza una cédula para compararla sin importar guiones, espacios ni mayúsculas.
const normalizeId = (id) => (id || '').toString().replace(/[-\s]/g, '').toLowerCase();

/**
 * Pantalla "Actualizar mensajero" (HU-004), exclusiva del Super Usuario. En una sola vista a la altura de
 * la pantalla, la flota de mensajeros a la izquierda (con búsqueda por documento) y a la derecha el
 * mensajero elegido —datos editables e historial— o el historial general de todos. Esta página solo
 * coordina las piezas: la flota (`useCourierFleet`), la edición (`useCourierEditor`), los avisos
 * (`useToast`) y la protección de cambios sin guardar (`useConfirmLeave`).
 * @param {{ initialCedula?: string }} props Documento con el que se abre la pantalla ya cargada.
 */
export function EditMessenger({ initialCedula = '' }) {
  const { toast, notify, close: closeToast } = useToast();
  const fleet = useCourierFleet();
  const search = useDocumentSearch(getCourierDocument);
  const generalHistory = useCourierGeneralHistory();

  // La flota se puede ocultar para darle todo el ancho al formulario (solo escritorio), y el historial
  // general reemplaza al detalle en el panel derecho mientras se ve.
  const [listOpen, setListOpen] = useState(true);
  const [showGeneral, setShowGeneral] = useState(false);

  const backToPicker = () => {
    setListOpen(true);
    setShowGeneral(false);
  };

  const editor = useCourierEditor({
    notify,
    onSaved: (updated) => {
      fleet.patch(updated);
      backToPicker();
    },
    onPartialSave: fleet.reload,
  });
  const { select: selectCourier } = editor;
  const { runOrConfirmLeave, dialogProps } = useConfirmLeave(editor.isDirty);

  // Cargar por cédula inicial si se proporciona (una sola vez: tras guardar se vuelve a "Elige un mensajero").
  const initialLoadedRef = useRef(false);
  useEffect(() => {
    if (!initialCedula || fleet.couriers.length === 0 || initialLoadedRef.current) return;
    const found = fleet.couriers.find((courier) => normalizeId(getCourierDocument(courier)) === normalizeId(initialCedula));
    if (found) {
      initialLoadedRef.current = true;
      selectCourier(found);
    }
  }, [initialCedula, fleet.couriers, selectCourier]);

  const handleSelect = (courier) => {
    if (courier.id === editor.courier?.id) {
      setShowGeneral(false);
      return;
    }
    runOrConfirmLeave(() => {
      setShowGeneral(false);
      editor.select(courier);
    });
  };

  // "Descartar" abandona la edición de una vez; "Volver" pide confirmar si hay cambios sin guardar.
  const handleDiscard = () => {
    editor.clear();
    backToPicker();
  };
  const handleBack = () => runOrConfirmLeave(handleDiscard);

  const openGeneralHistory = () => {
    setShowGeneral(true);
    generalHistory.load();
  };

  const courierName = getCourierName(editor.courier);

  return (
    <>
      <SplitScreen
        title="Actualizar mensajero"
        description="Busca al mensajero por su documento, corrige sus datos y guarda los cambios."
        columns={listOpen ? `${rem(340)} minmax(0, 1fr)` : 'minmax(0, 1fr)'}
      >
        <CourierFleetPanel
          couriers={search.filter(fleet.couriers)}
          totalCount={fleet.couriers.length}
          loading={fleet.loading}
          selectedKey={editor.courier ? getCourierDocument(editor.courier) : null}
          onSelect={handleSelect}
          search={search}
          canHide={Boolean(editor.courier)}
          onHide={() => setListOpen(false)}
          onOpenGeneralHistory={openGeneralHistory}
          generalHistoryOpen={showGeneral}
          sx={{ display: { xs: editor.courier || showGeneral ? 'none' : 'flex', md: listOpen ? 'flex' : 'none' } }}
        />

        {showGeneral && (
          <CourierGeneralHistoryPanel
            history={generalHistory}
            backLabel={editor.courier ? `Volver a ${courierName}` : 'Volver'}
            onBack={() => setShowGeneral(false)}
          />
        )}
        {!showGeneral && editor.courier && (
          <CourierDetailPanel
            key={editor.courier.id}
            editor={editor}
            onBack={handleBack}
            onDiscard={handleDiscard}
            listOpen={listOpen}
            onShowList={() => setListOpen(true)}
          />
        )}
        {!showGeneral && !editor.courier && (
          <EmptyState
            icon={PersonSearchOutlinedIcon}
            title="Elige un mensajero"
            description="Selecciona un mensajero de la lista para editar sus datos y ver su historial."
            sx={{ display: { xs: 'none', md: 'flex' } }}
          />
        )}
      </SplitScreen>

      <UnsavedChangesGuard when={editor.isDirty} />
      <ConfirmLeaveDialog {...dialogProps} />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </>
  );
}

export default EditMessenger;
