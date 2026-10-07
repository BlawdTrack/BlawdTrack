import { useEffect, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { usePolling } from '../hooks/usePolling';
import { useCourierFleet } from '../hooks/useCourierFleet';
import { useDeactivationAudit } from '../hooks/useDeactivationAudit';
import { useDocumentSearch } from '../hooks/useDocumentSearch';
import { useToast } from '../hooks/useToast';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';
import CourierDeactivationList from './CourierDeactivationList';
import DeactivationAuditPanel from './DeactivationAuditPanel';
import PageContainer from './PageContainer';
import PageHeaderBar from './PageHeaderBar';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: { md: '100vh' }, minHeight: 0 }}>
      <PageHeaderBar
        title="Desactivar mensajeros"
        description="Elige al mensajero que dejará de operar y confirma la desactivación. Queda registrada en el historial."
      />

      <PageContainer wide sx={{ flex: 1, minHeight: 0 }}>
        <Tabs
          value={mobileView}
          onChange={(_, value) => setMobileView(value)}
          variant="fullWidth"
          sx={{ display: { md: 'none' }, borderBottom: '1px solid #E4DED7' }}
        >
          <Tab value="fleet" label="Mensajeros" />
          <Tab value="audit" label={`Auditoría (${audit.entries.length})`} />
        </Tabs>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 420px' },
            gridTemplateRows: { md: 'minmax(0, 1fr)' },
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
          <DeactivationAuditPanel entries={audit.entries} sx={{ display: panelDisplay('audit') }} />
        </Box>
      </PageContainer>

      <DeactivateMessengerModal
        isOpen={Boolean(selectedCourier)}
        onClose={() => setSelectedCourier(null)}
        courier={selectedCourier}
        onDeactivateSuccess={handleDeactivated}
      />

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </Box>
  );
};
