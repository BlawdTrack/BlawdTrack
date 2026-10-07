import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Paper,
  Divider,
  Snackbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { usePolling, keepIfEqual } from '../hooks/usePolling';
import { listCouriers, getCourierDeactivations } from '../services/CourierService';
import { formatHistoryEntry } from '../utils/courierHistory';
import { getInitials } from '../utils/getInitials';
import { DeactivateMessengerModal } from './DeactivateMessengerModal';
import PageHeader from './PageHeader';
import PageContainer from './PageContainer';
import DocumentSearch from './DocumentSearch';
import StatusChip from './StatusChip';
import { CARD_SX } from './formStyles';
import { useDocumentSearch } from '../hooks/useDocumentSearch';

// Filas del panel de auditoría a partir de las desactivaciones guardadas en el backend.
const fetchDeactivationAudit = async () => {
  const entries = await getCourierDeactivations();
  return (Array.isArray(entries) ? entries : []).map((entry, index) => {
    const { id, when, by } = formatHistoryEntry(
      { timestamp: entry.timestamp, action: 'DESACTIVAR_MENSAJERO', actorName: entry.actorName },
      index
    );
    return {
      id: `${entry.documentNumber}-${id}`,
      date: when,
      action: 'Desactivación',
      details: `Mensajero ${entry.courierName} · ${entry.documentNumber}`,
      role: by,
    };
  });
};

const logAuditError = (auditError) => console.error('Error al cargar la auditoría de desactivaciones:', auditError);

// El backend aun no expone si un mensajero esta en labores ni sus paquetes
// pendientes (ver ProvisionalCourierWorkloadPort): se muestra el mismo texto
// fijo del mockup en vez de inventar datos reales que no existen todavia.
const DUTY_PLACEHOLDER = 'Fuera de labores';
const PENDING_PLACEHOLDER = 'Sin envíos en proceso';

const CARD_HEADER_SX = {
  p: { xs: 2.5, sm: '18px 24px' },
  borderBottom: '1px solid #E4DED7',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 1.5,
};

/**
 * Pantalla "Desactivar mensajero" (HU-005), exclusiva del Super Usuario. Lista los mensajeros, permite
 * buscarlos por tipo y número de documento y abre `DeactivateMessengerModal` para confirmar la
 * desactivación. Muestra además la auditoría de todas las desactivaciones registradas, aunque el
 * mensajero se haya reactivado después.
 */
export const MessengerFleetList = () => {
  const { logout } = useAuth();
  const [messengers, setMessengers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessenger, setSelectedMessenger] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);

  const search = useDocumentSearch();

  useEffect(() => {
    const fetchMessengers = async () => {
      try {
        const data = await listCouriers();
        if (!Array.isArray(data)) {
          throw new Error('La respuesta del backend no contiene una lista de mensajeros.');
        }
        setMessengers(data);
      } catch (requestError) {
        if (requestError.response?.status === 401) {
          logout();
          return;
        }
        setLoadError(
          requestError.response?.data?.message ||
            requestError.message ||
            'No se pudo cargar la lista de mensajeros.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessengers();
  }, [logout]);

  // Mantiene al día la lista y la auditoría sin recargar la página. Falla en silencio: si una consulta
  // no responde (o la sesión venció, de lo que ya se encarga el interceptor) se conserva lo que hay.
  usePolling(async () => {
    try {
      const data = await listCouriers();
      if (Array.isArray(data)) setMessengers((current) => keepIfEqual(current, data));
      const audit = await fetchDeactivationAudit();
      setAuditLogs((current) => keepIfEqual(current, audit));
    } catch (refreshError) {
      console.error('No se pudo actualizar la lista de mensajeros:', refreshError);
    }
  });

  const handleOpenModal = (messenger) => {
    setSelectedMessenger(messenger);
    setIsModalOpen(true);
  };

  // Todas las desactivaciones registradas: la auditoría vive en la base de datos y se conserva aunque el
  // mensajero se reactive, así que se carga completa desde el backend y no solo la de esta sesión.
  useEffect(() => {
    fetchDeactivationAudit().then(setAuditLogs).catch(logAuditError);
  }, []);

  const handleSuccessfulDeactivation = () => {
    setMessengers((previous) =>
      previous.map((messenger) =>
        messenger.id === selectedMessenger.id
          ? { ...messenger, status: 'INACTIVE' }
          : messenger
      )
    );
    fetchDeactivationAudit().then(setAuditLogs).catch(logAuditError);

    setIsModalOpen(false);
    setSnackbarOpen(true);
  };

  const visibleMessengers = search.filter(messengers);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ maxWidth: '900px', margin: '0 auto', p: { xs: 1.5, sm: 2 } }}>
        <Alert severity="error">{loadError}</Alert>
      </Box>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Desactivar mensajeros"
        description="Elige al mensajero que dejará de operar y confirma la desactivación. Queda registrada en el historial."
      />

      {/* BUSCADOR */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
            Buscar mensajero por documento
          </Typography>
        </Box>
        <Box sx={{ p: { xs: 2.5, sm: '20px 24px' } }}>
          <DocumentSearch search={search} />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box
          sx={{
            p: { xs: 2.5, sm: '22px 28px' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>
            Mensajeros · desactivación de acceso
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
            El historial de entregas se conserva siempre
          </Typography>
        </Box>

        {messengers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No hay mensajeros disponibles para mostrar.
          </Alert>
        ) : visibleMessengers.length === 0 ? (
          <Alert severity="info" sx={{ m: 2 }}>
            No se encontró ningún mensajero con ese documento.
          </Alert>
        ) : (
          visibleMessengers.map((messenger, index) => {
            const isActive = messenger.status === 'ACTIVE';
            return (
              <React.Fragment key={messenger.id ?? messenger.documentNumber}>
                {index > 0 && <Divider sx={{ borderColor: '#EFEAE4' }} />}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: '20px 28px' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    flexWrap: 'wrap',
                  }}
                >
                  <Avatar sx={{ width: 46, height: 46, bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 700, fontSize: 14, flex: '0 0 46px' }}>
                    {getInitials(messenger.fullName)}
                  </Avatar>

                  <Box sx={{ flex: '1 1 220px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1F2421' }}>
                      {messenger.fullName}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
                      {messenger.documentNumber} · {messenger.schedule}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: '0 1 220px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#2F7D4F' }}>
                      {DUTY_PLACEHOLDER}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#6B6560' }}>
                      {PENDING_PLACEHOLDER}
                    </Typography>
                  </Box>

                  <StatusChip active={isActive} />

                  <Button
                    variant="outlined"
                    disabled={!isActive}
                    onClick={() => handleOpenModal(messenger)}
                    sx={{
                      borderRadius: '10px',
                      px: 2.5,
                      py: '12px',
                      fontWeight: 600,
                      fontSize: 14,
                      bgcolor: '#fff',
                      color: isActive ? '#C0392B' : '#7A736A',
                      borderColor: isActive ? '#C0392B' : '#E4DED7',
                      '&:hover': { bgcolor: isActive ? '#FCEDEA' : '#fff', borderColor: isActive ? '#C0392B' : '#E4DED7' },
                    }}
                  >
                    {isActive ? 'Desactivar' : 'Inactivo'}
                  </Button>
                </Box>
              </React.Fragment>
            );
          })
        )}
      </Paper>

      <Box
        sx={{
          bgcolor: '#FCF3E3',
          border: '1px solid #EBC98A',
          borderRadius: '14px',
          p: '20px 22px',
          display: 'flex',
          gap: '14px',
        }}
      >
        <Box sx={{ width: '9px', height: '9px', borderRadius: '50%', bgcolor: '#C9860F', mt: '6px', flex: '0 0 9px' }} />
        <Typography sx={{ fontSize: 14, color: '#7A5A12', lineHeight: 1.6 }}>
          Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso.
          Tras desactivarlo no recibe nuevas asignaciones y sus paquetes pendientes deben
          reasignarse manualmente.
        </Typography>
      </Box>

      {/* AUDITORÍA */}
      <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
        <Box sx={CARD_HEADER_SX}>
          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
            Auditoría de desactivaciones
          </Typography>
        </Box>

        <Box>
          {auditLogs.length === 0 ? (
            <Typography sx={{ p: '20px 24px', fontSize: 14, color: '#6B6560', textAlign: 'center' }}>
              No hay desactivaciones registradas.
            </Typography>
          ) : (
            auditLogs.map((log, index) => (
              <React.Fragment key={log.id}>
                {index > 0 && <Divider sx={{ borderColor: '#EFEAE4' }} />}
                <Box
                  sx={{
                    p: { xs: 2.5, sm: '14px 24px' },
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6560', flex: '0 0 150px' }}>
                    {log.date}
                  </Typography>
                  <Chip
                    label={log.action}
                    size="small"
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      borderRadius: '20px',
                      bgcolor: '#FCEDEA',
                      color: '#C0392B',
                    }}
                  />
                  <Typography sx={{ fontSize: 14, color: '#1F2421', flex: '1 1 200px', minWidth: 0 }}>
                    {log.details}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#6B6560' }}>
                    {log.role}
                  </Typography>
                </Box>
              </React.Fragment>
            ))
          )}
        </Box>
      </Paper>

      <DeactivateMessengerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courier={selectedMessenger}
        onDeactivateSuccess={handleSuccessfulDeactivation}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" variant="filled">
          Mensajero desactivado correctamente.
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
