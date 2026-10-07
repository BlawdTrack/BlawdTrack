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
 * pantalla: la flota (con búsqueda por documento) y la auditoría de todas las desactivaciones registradas,
 * aunque el mensajero se haya reactivado después. Desactivar abre `DeactivateMessengerModal` para
 * confirmar. En móvil las dos vistas se alternan con pestañas. Solo coordina: los datos vienen de
 * `useCourierFleet` y `useDeactivationAudit`, y las partes visuales son componentes aparte.
 */
export const MessengerFleetList = () => {
  const { logout } = useAuth();
  const fleet = useCourierFleet();
  const audit = useDeactivationAudit();
  const search = useDocumentSearch();
  const { toast, notify, close: closeToast } = useToast();

  const [selectedCourier, setSelectedCourier] = useState(null);
  const [mobileView, setMobileView] = useState('fleet');

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
  // En móvil solo se ve una de las dos vistas; en escritorio, ambas lado a lado.
  const panelDisplay = (view) => ({ xs: mobileView === view ? 'flex' : 'none', md: 'flex' });

  return (
    <>
      <SplitScreen
        title="Desactivar mensajeros"
        description="Elige al mensajero que dejará de operar y confirma la desactivación. Queda registrada en el historial."
        columns="minmax(0, 1fr) 420px"
        tabs={{
          value: mobileView,
          onChange: setMobileView,
          items: [
            { value: 'fleet', label: 'Mensajeros' },
            { value: 'audit', label: `Auditoría (${audit.entries.length})` },
          ],
        }}
      >
        <CourierDeactivationList
          couriers={visibleCouriers}
          totalCount={fleet.couriers.length}
          loading={fleet.loading}
          errorMessage={fleet.error?.message}
          search={search}
          onDeactivate={setSelectedCourier}
          sx={{ display: panelDisplay('fleet') }}
        />
        <AuditPanel
          title="Auditoría de desactivaciones"
          entries={audit.entries}
          emptyMessage="No hay desactivaciones registradas."
          sx={{ display: panelDisplay('audit') }}
        />
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
