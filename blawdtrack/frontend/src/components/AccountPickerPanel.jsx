import {
  Alert,
  Avatar,
  Box,
  Button,
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
 * Panel para elegir a una persona de una lista que se edita (mensajeros, administradores…): búsqueda por documento,
 * la lista con el estado de acceso de cada una y el botón de su historial general. Elegir una fila avisa con
 * `onSelect`; no sabe nada de cómo se edita. Lo usan "Actualizar mensajero" y "Actualizar administrador".
 *
 * @param {{
 *   searchTitle: string, listTitle: string, columnTitle: string, noun: [string, string],
 *   items: object[], totalCount: number, loading: boolean, errorMessage?: string|null, onRetry?: Function,
 *   selectedKey: unknown, onSelect: (item: object) => void, search: object,
 *   getKey: (item: object) => string, getName: (item: object) => string, getSubtitle: (item: object) => string,
 *   isActive: (item: object) => boolean, emptyMessage: string, noMatchMessage: string,
 *   canHide: boolean, onHide: Function, hideLabel: string,
 *   historyLabel: string, onOpenHistory: Function, historyOpen: boolean, sx?: object }} props `items` ya viene filtrada;
 *   `totalCount` es el total sin filtrar (para distinguir "no hay ninguna" de "ninguna coincide"); `noun` es
 *   [singular, plural] para el contador.
 */
export default function AccountPickerPanel({
  searchTitle,
  listTitle,
  columnTitle,
  noun,
  items,
  totalCount,
  loading,
  errorMessage,
  onRetry,
  selectedKey,
  onSelect,
  search,
  getKey,
  getName,
  getSubtitle,
  isActive,
  emptyMessage,
  noMatchMessage,
  canHide,
  onHide,
  hideLabel,
  historyLabel,
  onOpenHistory,
  historyOpen,
  sx,
}) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'neutral.border', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography sx={HEADING_SX}>{searchTitle}</Typography>
          {canHide && (
            <Tooltip title={hideLabel}>
              <IconButton
                onClick={onHide}
                aria-label={hideLabel}
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
        <Typography sx={HEADING_SX}>{listTitle}</Typography>
        <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>
          {items.length} {items.length === 1 ? noun[0] : noun[1]}
        </Typography>
      </Box>

      <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <Table stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={HEADER_CELL_SX}>{columnTitle}</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, width: STATUS_COLUMN_WIDTH }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const key = getKey(item);
              const name = getName(item);
              const selected = selectedKey === key;
              return (
                <TableRow
                  key={key}
                  hover
                  selected={selected}
                  sx={{ cursor: 'pointer', '& td': { borderColor: '#EFEAE4' }, '&.Mui-selected': { bgcolor: '#F7F3EE' } }}
                  onClick={() => onSelect(item)}
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
                          {getSubtitle(item)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ px: 2.5, py: 1.5, width: STATUS_COLUMN_WIDTH }}>
                    <StatusChip active={isActive(item)} />
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
            {!loading && errorMessage && (
              <TableRow>
                <TableCell colSpan={2} sx={{ p: 2 }}>
                  <Alert
                    severity="error"
                    action={onRetry && (
                      <Button color="inherit" size="small" onClick={onRetry} sx={{ fontWeight: 600 }}>
                        Reintentar
                      </Button>
                    )}
                  >
                    {errorMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
            {!loading && !errorMessage && totalCount === 0 && <MessageRow>{emptyMessage}</MessageRow>}
            {totalCount > 0 && items.length === 0 && <MessageRow>{noMatchMessage}</MessageRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <HistoryButton label={historyLabel} onClick={onOpenHistory} active={historyOpen} />
    </Paper>
  );
}
