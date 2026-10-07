import { Box, Chip, Paper, Typography } from '@mui/material';
import BackButton from './BackButton';
import HistoryList from './HistoryList';
import { CARD_SX } from './formStyles';
import { recordsLabel } from '../utils/courierEdit';

/**
 * Panel de auditoría: lo que quedó registrado, de lo más reciente a lo más antiguo, con a quién afectó y
 * quién lo hizo. Sirve para cualquier auditoría (desactivaciones, altas y bajas de administradores…).
 * @param {{ title: string, entries: object[], emptyMessage: string, onBack?: Function, sx?: object }} props
 *   `entries` son filas con la forma de `HistoryList` (por ejemplo, las de `formatHistoryEntry`); con `onBack`
 *   el encabezado lleva el botón "Volver" para regresar a la lista.
 */
export default function AuditPanel({ title, entries, emptyMessage, onBack, sx }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', flexDirection: 'column', minHeight: 0, ...sx }}>
      <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #E4DED7' }}>
        {onBack && <BackButton onClick={onBack} />}
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: 'primary.main' }}>{title}</Typography>
        <Chip
          label={recordsLabel(entries.length)}
          size="small"
          sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#F1ECE7', color: '#6B6560', borderRadius: '20px' }}
        />
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <HistoryList entries={entries} showSubject emptyMessage={emptyMessage} />
      </Box>
    </Paper>
  );
}
