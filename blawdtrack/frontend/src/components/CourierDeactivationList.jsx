import { IconButton, Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountRow from './AccountRow';
import HistoryButton from './HistoryButton';
import SearchableListPanel from './SearchableListPanel';
import StatusChip from './StatusChip';
import { DEACTIVATION_CONDITION, DEACTIVATION_REASSIGN, DEACTIVATION_REACTIVATE } from '../config/deactivationRules';

// El backend aún no expone si un mensajero está en labores ni sus paquetes pendientes (ver
// ProvisionalCourierWorkloadPort): se muestra el mismo texto fijo del mockup en vez de inventar datos
// reales que todavía no existen.
const DUTY_PLACEHOLDER = 'Fuera de labores · Sin envíos en proceso';

const RULE_HELP = `${DEACTIVATION_CONDITION} Tras desactivarlo no recibe nuevas asignaciones. ${DEACTIVATION_REASSIGN} ${DEACTIVATION_REACTIVATE}`;

/**
 * Panel de la flota para desactivar mensajeros (HU-005): búsqueda por documento y lista con el botón
 * "Desactivar" de cada uno. La regla de cuándo se puede desactivar está en el icono de ayuda del título y
 * la consecuencia se repite en el cuadro de confirmación. Solo muestra; la acción la decide quien lo usa
 * con `onDeactivate`.
 * @param {{ couriers: object[], totalCount: number, loading: boolean, errorMessage?: string|null,
 *   search: object, onDeactivate: (courier: object) => void, onOpenAudit: Function, onRetry?: Function,
 *   sx?: object }} props
 *   `couriers` ya viene filtrada; `totalCount` es el total sin filtrar; `onOpenAudit` abre la auditoría.
 */
export default function CourierDeactivationList({ couriers, totalCount, loading, errorMessage, search, onDeactivate, onOpenAudit, onRetry, sx }) {
  return (
    <SearchableListPanel
      searchTitle="Buscar mensajero por documento"
      search={search}
      listTitle="Mensajeros · desactivación de acceso"
      titleExtra={(
        <Tooltip
          arrow
          enterTouchDelay={0}
          leaveTouchDelay={8000}
          title={RULE_HELP}
          slotProps={{ tooltip: { sx: { fontSize: 14, lineHeight: 1.5, maxWidth: 340, p: 1.5 } } }}
        >
          <IconButton aria-label="¿Cuándo se puede desactivar a un mensajero?" sx={{ width: 44, height: 44, my: '-10px', color: '#6B6560' }}>
            <InfoOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      meta={<Typography sx={{ fontSize: 12, color: '#6B6560' }}>El historial de entregas se conserva siempre</Typography>}
      items={couriers}
      totalCount={totalCount}
      loading={loading}
      errorMessage={errorMessage}
      onRetry={onRetry}
      emptyMessage="No hay mensajeros disponibles para mostrar."
      noMatchMessage="No se encontró ningún mensajero con ese documento."
      sx={sx}
      footer={<HistoryButton label="Ver auditoría" onClick={onOpenAudit} />}
      renderItem={(courier) => {
        const isActive = courier.status === 'ACTIVE';
        return (
          <AccountRow
            key={courier.id ?? courier.documentNumber}
            name={courier.fullName}
            lines={[{ text: `${courier.documentNumber} · ${courier.schedule}` }, { text: DUTY_PLACEHOLDER, tone: 'success' }]}
            status={<StatusChip active={isActive} />}
            actionLabel={isActive ? 'Desactivar' : 'Inactivo'}
            actionDisabled={!isActive}
            onAction={() => onDeactivate(courier)}
          />
        );
      }}
    />
  );
}
