import { useRef, useState } from 'react';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import DeletePackageDialog from '../components/packages/DeletePackageDialog';
import PackageDeletionList from '../components/packages/PackageDeletionList';
import { usePackageDeletion } from '../hooks/usePackageDeletion';
import { TEMPORARY_PACKAGES } from '../mocks/temporaryPackages';

/**
 * Pantalla "Eliminar paquetes" (HU-012), del Administrador de Ventas: la lista de distribución con el botón
 * "Eliminar" en cada paquete y el diálogo que confirma antes de llamar al backend. Por ahora la lista sale de un
 * fixture temporal (ver `TEMPORARY_PACKAGES`). Solo coordina: la eliminación la orquesta `usePackageDeletion`.
 */
export default function PackageDeletionPage() {
  const [paquetes, setPaquetes] = useState(TEMPORARY_PACKAGES);
  const listTitleRef = useRef(null);
  // La fila eliminada se lleva el botón que abrió el diálogo: el foco pasa al título de la lista al cerrarse.
  const shouldFocusListRef = useRef(false);

  const deletion = usePackageDeletion({
    onDeleted: (paquete) => {
      setPaquetes((current) => current.filter((item) => item.shipmentNumber !== paquete.shipmentNumber));
      shouldFocusListRef.current = true;
    },
    // T07 (#123): pasar aquí `onResult` para mostrar el mensaje del resultado y recargar la lista tras un 409/404.
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
      <PackageDeletionList paquetes={paquetes} onEliminar={deletion.open} titleRef={listTitleRef} />
      <DeletePackageDialog
        paquete={deletion.selected}
        isDeleting={deletion.isDeleting}
        onCancel={deletion.close}
        onConfirm={deletion.confirm}
        onClosed={handleDialogClosed}
      />
    </PageContainer>
  );
}
