import { useRef } from 'react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Toast from '../components/Toast';
import DeletePackageDialog from '../components/packages/DeletePackageDialog';
import PackageDeletionList from '../components/packages/PackageDeletionList';
import { usePackageDeletion } from '../hooks/usePackageDeletion';
import { usePackageList } from '../hooks/usePackageList';
import { useToast } from '../hooks/useToast';
import {
  getBlockedPackageMessage,
  getDeletionResultMessage,
  shouldReloadAfter,
} from '../utils/packageDeletionMessages';

/**
 * Pantalla "Eliminar paquetes" (HU-012), del Administrador de Ventas: la lista de distribución con el botón
 * "Eliminar" en cada paquete, el diálogo que confirma antes de llamar al backend y el aviso con el resultado. Solo
 * coordina: la lista sale de `usePackageList`, la eliminación la orquesta `usePackageDeletion` y los textos vienen de
 * `packageDeletionMessages`.
 */
export default function PackageDeletionPage() {
  const list = usePackageList();
  const { toast, notify, close: closeToast } = useToast();
  const listTitleRef = useRef(null);
  // La fila eliminada se lleva el botón que abrió el diálogo: el foco pasa al título de la lista al cerrarse.
  const shouldFocusListRef = useRef(false);

  const show = (feedback) => {
    if (feedback) notify(feedback.message, feedback.severity);
  };

  const deletion = usePackageDeletion({
    onDeleted: (paquete) => {
      list.removePackage(paquete.shipmentNumber);
      shouldFocusListRef.current = true;
    },
    onResult: (result) => {
      show(getDeletionResultMessage(result));
      // Tras un 409 o un 404 alguien más pudo cambiar el estado del paquete o eliminarlo.
      if (shouldReloadAfter(result)) {
        list.reload({ missingShipmentNumber: result.status === 404 ? result.paquete.shipmentNumber : undefined });
      }
    },
  });

  const handleDialogClosed = () => {
    if (shouldFocusListRef.current) {
      shouldFocusListRef.current = false;
      listTitleRef.current?.focus();
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Eliminar paquetes"
        description="Elimina de la lista de distribución los paquetes que todavía no salieron a reparto."
      />
      <PackageDeletionList
        paquetes={list.paquetes}
        onEliminar={deletion.open}
        onBloqueado={(paquete) => show(getBlockedPackageMessage(paquete))}
        titleRef={listTitleRef}
      />
      <DeletePackageDialog
        paquete={deletion.selected}
        isDeleting={deletion.isDeleting}
        onCancel={deletion.close}
        onConfirm={deletion.confirm}
        onClosed={handleDialogClosed}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </PageContainer>
  );
}
