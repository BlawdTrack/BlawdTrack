import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PackageDeletionList from '../components/packages/PackageDeletionList';
import { TEMPORARY_PACKAGES } from '../mocks/temporaryPackages';

/**
 * Pantalla "Eliminar paquetes" (HU-012), del Administrador de Ventas: la lista de distribución con el botón
 * "Eliminar" en cada paquete. Por ahora la lista sale de un fixture temporal (ver `TEMPORARY_PACKAGES`).
 */
export default function PackageDeletionPage() {
  // TEMPORAL (T05 #121): T06 reemplaza este manejador por el diálogo de confirmación. No elimina nada ni llama a la
  // API; solo deja constancia en la consola de que el botón emitió el paquete.
  const handleEliminar = (paquete) => {
    console.info('[HU-012 T05] onEliminar', paquete.shipmentNumber);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Eliminar paquetes"
        description="Elimina de la lista de distribución los paquetes que todavía no salieron a reparto."
      />
      <PackageDeletionList paquetes={TEMPORARY_PACKAGES} onEliminar={handleEliminar} />
    </PageContainer>
  );
}
