import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePolling } from '../hooks/usePolling';
import { useCourierFleet } from '../hooks/useCourierFleet';
import { useDeactivationAudit } from '../hooks/useDeactivationAudit';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { useToast } from '../hooks/useToast';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';
import CourierDeactivationList from './CourierDeactivationList';
import AuditPanel from './AuditPanel';
import SplitScreen from './SplitScreen';
import Toast from './Toast';

/**
 * Pantalla "Desactivar mensajero" (HU-005), exclusiva del Super Usuario. En una sola vista a la altura de la
 * pantalla: la flota (con búsqueda por documento) o, con un botón, la auditoría de todas las
 * desactivaciones registradas, aunque el mensajero se haya reactivado después. Desactivar abre
 * `DeactivateMessengerModal` para confirmar. Solo coordina: los datos vienen de
 * `useCourierFleet` y `useDeactivationAudit`, y las partes visuales son componentes aparte.
 */
export const MessengerFleetList = () => {
  const { logout } = useAuth();
  const fleet = useCourierFleet();
  const audit = useDeactivationAudit();
  const search = useDocumentSearch();
  const { toast, notify, close: closeToast } = useToast();

  const [selectedCourier, setSelectedCourier] = useState(null);
  // La auditoría reemplaza a la lista mientras se ve (como el historial general de Actualizar mensajero).
  const [showAudit, setShowAudit] = useState(false);

  // Una sesión vencida al cargar la flota cierra la sesión (el resto de errores se muestran en la lista).
  const loadErrorStatus = fleet.error?.status;
  useEffect(() => {
    if (loadErrorStatus === 401) logout();
  }, [loadErrorStatus, logout]);

  // Mantiene al día la lista y la auditoría sin recargar la página.
  usePolling(() => {
    fleet.refresh();
    audit.reload();
  });

  const handleDeactivated = () => {
    fleet.patch({ ...selectedCourier, status: 'INACTIVE' });
    audit.reload();
    setSelectedCourier(null);
    notify('Mensajero desactivado correctamente.', 'success');
  };

  const visibleCouriers = search.filter(fleet.couriers);
  return (
    <>
      <SplitScreen
        title="Desactivar mensajeros"
        description="Elige al mensajero que dejará de operar y confirma la desactivación. Queda registrada en el historial."
        columns="minmax(0, 1fr)"
      >
        {showAudit ? (
          <AuditPanel
            title="Auditoría de desactivaciones"
            entries={audit.entries}
            emptyMessage="No hay desactivaciones registradas."
            onBack={() => setShowAudit(false)}
            sx={{ display: 'flex' }}
          />
        ) : (
          <CourierDeactivationList
            couriers={visibleCouriers}
            totalCount={fleet.couriers.length}
            loading={fleet.loading}
            errorMessage={fleet.error?.message}
            onRetry={fleet.reload}
            search={search}
            onDeactivate={setSelectedCourier}
            onOpenAudit={() => setShowAudit(true)}
            sx={{ display: 'flex' }}
          />
        )}
      </SplitScreen>

      <DeactivateMessengerModal
        isOpen={Boolean(selectedCourier)}
        onClose={() => setSelectedCourier(null)}
        courier={selectedCourier}
        onDeactivateSuccess={handleDeactivated}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </>
  );
};
