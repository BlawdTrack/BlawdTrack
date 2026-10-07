import { Box, Chip, Paper, Typography } from '@mui/material';
import HistoryList from './HistoryList';
import { CARD_SX } from './formStyles';
import { recordsLabel } from '../utils/courierEdit';

/**
 * Auditoría de desactivaciones: todas las que quedaron registradas, de la más reciente a la más antigua,
 * con el mensajero afectado y quién la hizo.
 * @param {{ entries: object[], sx?: object }} props `entries` son filas formateadas por `formatHistoryEntry`.
 */
export default function DeactivationAuditPanel({ entries, sx }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #E4DED7' }}>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
          Auditoría de desactivaciones
        </Typography>
        <Chip
          label={recordsLabel(entries.length)}
          size="small"
          sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#F1ECE7', color: '#6B6560', borderRadius: '20px' }}
        />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <HistoryList entries={entries} showSubject emptyMessage="No hay desactivaciones registradas." />
      </Box>
    </Paper>
  );
}
