import PackageHistoryCard from './PackageHistoryCard';
import PackageProofCard from './PackageProofCard';
import { usePackageHistory } from '../hooks/usePackageHistory';

/**
 * Seguimiento del paquete que se muestra bajo su ficha (HU-013): el historial de cambios de estado y, en un paquete
 * entregado, el comprobante de entrega. El historial se carga para el número de envío de la ficha y se recarga solo
 * si cambia; el comprobante usa ese mismo historial para dar la fecha real de la entrega, sin pedir nada más.
 * @param {{ pkg: { shipmentNumber: string, status: string } }} props Detalle del paquete ya consultado.
 */
export default function PackageFollowUp({ pkg }) {
  const history = usePackageHistory(pkg.shipmentNumber);

  return (
    <>
      <PackageHistoryCard
        state={history.state}
        entries={history.entries}
        message={history.message}
        retryable={history.retryable}
        onRetry={history.retry}
      />
      {pkg.status === 'DELIVERED' && <PackageProofCard pkg={pkg} entries={history.entries} />}
    </>
  );
}
