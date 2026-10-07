import { Alert, Avatar, Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import DocumentSearch from './DocumentSearch';
import StatusChip from './StatusChip';
import { CARD_SX } from './formStyles';
import { getInitials } from '../utils/getInitials';

// El backend aún no expone si un mensajero está en labores ni sus paquetes pendientes (ver
// ProvisionalCourierWorkloadPort): se muestra el mismo texto fijo del mockup en vez de inventar datos
// reales que todavía no existen.
const DUTY_PLACEHOLDER = 'Fuera de labores';
const PENDING_PLACEHOLDER = 'Sin envíos en proceso';

const HEADING_SX = { fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' };

function CourierRow({ courier, onDeactivate }) {
  const isActive = courier.status === 'ACTIVE';

  return (
    <Box sx={{ px: 2.5, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Avatar sx={{ width: 44, height: 44, bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 700, fontSize: 14, flex: '0 0 44px' }}>
        {getInitials(courier.fullName)}
      </Avatar>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1F2421' }}>{courier.fullName}</Typography>
        <Typography sx={{ fontSize: 14, color: '#6B6560' }}>
          {courier.documentNumber} · {courier.schedule}
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#2F7D4F', fontWeight: 600 }}>
          {DUTY_PLACEHOLDER} · {PENDING_PLACEHOLDER}
        </Typography>
      </Box>

      <StatusChip active={isActive} />

      <Button
        variant="outlined"
        disabled={!isActive}
        onClick={() => onDeactivate(courier)}
        sx={{
          borderRadius: '10px',
          px: 2.5,
          minHeight: 44,
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
  );
}

/**
 * Panel de la flota para desactivar mensajeros (HU-005): búsqueda por documento, lista con el botón
 * "Desactivar" de cada uno y, al pie, el aviso de cuándo se puede desactivar. Solo muestra; la acción
 * la decide quien lo usa con `onDeactivate`.
 * @param {{ couriers: object[], totalCount: number, loading: boolean, errorMessage?: string|null,
 *   search: object, onDeactivate: (courier: object) => void, sx?: object }} props `couriers` ya viene
 *   filtrada; `totalCount` es el total sin filtrar.
 */
export default function CourierDeactivationList({ couriers, totalCount, loading, errorMessage, search, onDeactivate, sx }) {
  let body;
  if (loading) {
    body = (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={28} />
      </Box>
    );
  } else if (errorMessage) {
    body = <Alert severity="error" sx={{ m: 2 }}>{errorMessage}</Alert>;
  } else if (totalCount === 0) {
    body = <Alert severity="info" sx={{ m: 2 }}>No hay mensajeros disponibles para mostrar.</Alert>;
  } else if (couriers.length === 0) {
    body = <Alert severity="info" sx={{ m: 2 }}>No se encontró ningún mensajero con ese documento.</Alert>;
  } else {
    body = couriers.map((courier) => (
      <CourierRow key={courier.id ?? courier.documentNumber} courier={courier} onDeactivate={onDeactivate} />
    ));
  }

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #E4DED7', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography sx={HEADING_SX}>Buscar mensajero por documento</Typography>
        <DocumentSearch search={search} />
      </Box>

      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography sx={HEADING_SX}>Mensajeros · desactivación de acceso</Typography>
        <Typography sx={{ fontSize: 12, color: '#6B6560' }}>El historial de entregas se conserva siempre</Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>{body}</Box>

      <Box sx={{ bgcolor: '#FCF3E3', borderTop: '1px solid #EBC98A', p: '14px 20px', display: 'flex', gap: '14px' }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#C9860F', mt: '6px', flex: '0 0 9px' }} />
        <Typography sx={{ fontSize: 14, color: '#7A5A12', lineHeight: 1.5 }}>
          Un mensajero solo puede desactivarse si está fuera de labores y sin envíos en proceso. Tras desactivarlo
          no recibe nuevas asignaciones y sus paquetes pendientes deben reasignarse manualmente.
        </Typography>
      </Box>
    </Paper>
  );
}
