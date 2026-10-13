import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ChevronLeftOutlinedIcon from '@mui/icons-material/ChevronLeftOutlined';
import DocumentSearch from './DocumentSearch';
import HistoryButton from './HistoryButton';
import StatusChip from './StatusChip';
import { CARD_SX } from './formStyles';
import { getInitials } from '../utils/getInitials';
import { getCourierDocument, getCourierName, getScheduleTimeRange, isCourierActive } from '../utils/courierEdit';
import { FONT, rem } from '../theme';

const HEADING_SX = { fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.md, color: 'primary.main' };
const HEADER_CELL_SX = {
  bgcolor: 'neutral.surface',
  fontSize: FONT.xs,
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'text.secondary',
  letterSpacing: '.9px',
  border: 0,
  py: 1,
  px: 2.5,
};
const STATUS_COLUMN_WIDTH = 104;

function MessageRow({ children }) {
  return (
    <TableRow>
      <TableCell colSpan={2} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
        {children}
      </TableCell>
    </TableRow>
  );
}

/**
 * Panel de la flota de mensajeros: búsqueda por documento, lista con el estado de cada uno y el botón del
 * historial general. Elegir una fila avisa con `onSelect`; no sabe nada de cómo se edita.
 * @param {{ couriers: object[], totalCount: number, loading: boolean, selectedKey: unknown,
 *   onSelect: (courier: object) => void, search: object, canHide: boolean, onHide: Function,
 *   onOpenGeneralHistory: Function, generalHistoryOpen: boolean, sx?: object }} props `couriers` ya viene
 *   filtrada; `totalCount` es el total sin filtrar (para distinguir "no hay ninguno" de "ninguno coincide").
 */
export default function CourierFleetPanel({
  couriers,
  totalCount,
  loading,
  selectedKey,
  onSelect,
  search,
  canHide,
  onHide,
  onOpenGeneralHistory,
  generalHistoryOpen,
  sx,
}) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'neutral.border', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={HEADING_SX}>Buscar mensajero por documento</Typography>
          {canHide && (
            <Tooltip title="Ocultar la flota de mensajeros">
              <IconButton
                onClick={onHide}
                aria-label="Ocultar la flota de mensajeros"
                sx={{ display: { xs: 'none', md: 'inline-flex' }, width: 44, height: 44, my: -1, color: 'primary.main' }}
              >
                <ChevronLeftOutlinedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <DocumentSearch search={search} variant="stacked" />
      </Box>

      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={HEADING_SX}>Flota de mensajeros</Typography>
        <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
          {couriers.length} {couriers.length === 1 ? 'mensajero' : 'mensajeros'}
        </Typography>
      </Box>

      <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>Mensajero</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, width: STATUS_COLUMN_WIDTH }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {couriers.map((courier) => {
              const key = getCourierDocument(courier);
              const name = getCourierName(courier);
              const selected = selectedKey === key;
              return (
                <TableRow
                  key={key}
                  hover
                  selected={selected}
                  sx={{ cursor: 'pointer', '& td': { borderColor: '#EFEAE4' }, '&.Mui-selected': { bgcolor: '#F7F3EE' } }}
                  onClick={() => onSelect(courier)}
                >
                  <TableCell sx={{ px: 2.5, py: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: rem(30),
                          height: rem(30),
                          flex: `0 0 ${rem(30)}`,
                          bgcolor: selected ? 'primary.main' : 'neutral.surface',
                          color: selected ? 'common.white' : 'text.secondary',
                          fontWeight: 700,
                          fontSize: FONT.xs,
                        }}
                      >
                        {getInitials(name)}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, color: '#1F2421', fontSize: FONT.sm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </Typography>
                        <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {key ?? ''}
                          {' · '}
                          {getScheduleTimeRange(courier.schedule || courier.horario)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 2.5, py: 1.5, width: STATUS_COLUMN_WIDTH }}>
                    <StatusChip active={isCourierActive(courier)} />
                  </TableCell>
                </TableRow>
              );
            })}
            {loading && totalCount === 0 && (
              <TableRow>
                <TableCell colSpan={2} sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && totalCount === 0 && <MessageRow>No hay mensajeros disponibles</MessageRow>}
            {totalCount > 0 && couriers.length === 0 && <MessageRow>No se encontró ningún mensajero con ese documento.</MessageRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <HistoryButton label="Ver historial general" onClick={onOpenGeneralHistory} active={generalHistoryOpen} />
    </Paper>
  );
}
