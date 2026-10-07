import { Box, Button, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryList from './HistoryList';
import StatusMessage from './StatusMessage';
import { CARD_SX } from './formStyles';
import { recordsLabel } from '../utils/courierEdit';

/**
 * Historial general: los cambios de TODOS los mensajeros, cada uno con el mensajero al que pertenece.
 * @param {{ history: ReturnType<typeof import('../hooks/useCourierHistory').useCourierGeneralHistory>,
 *   backLabel: string, onBack: Function }} props `backLabel` dice a dónde se vuelve ("Volver" o
 *   "Volver a María…").
 */
export default function CourierGeneralHistoryPanel({ history, backLabel, onBack }) {
  const { entries, status, load } = history;

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid #E4DED7' }}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{ color: 'primary.main', fontWeight: 600, border: '1.5px solid #DCD4CA' }}
        >
          {backLabel}
        </Button>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 18, color: 'primary.main' }}>
          Historial general de mensajeros
        </Typography>
        {status === 'idle' && (
          <Chip
            label={recordsLabel(entries.length)}
            size="small"
            sx={{ fontSize: 12, fontWeight: 600, bgcolor: '#F1ECE7', color: '#6B6560', borderRadius: '20px' }}
          />
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {status === 'loading' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {status === 'error' && (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
            <StatusMessage severity="error" message="No se pudo cargar el historial general. Revisa tu conexión e inténtalo de nuevo." />
            <Button variant="outlined" onClick={load} sx={{ fontWeight: 600 }}>
              Reintentar
            </Button>
          </Box>
        )}
        {status === 'idle' && (
          <HistoryList entries={entries} showSubject emptyMessage="Todavía no hay cambios registrados en ningún mensajero." />
        )}
      </Box>
    </Paper>
  );
}
