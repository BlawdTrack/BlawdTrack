import { Box, Button, Chip, CircularProgress, Paper, Typography } from '@mui/material';
import BackButton from './BackButton';
import HistoryList from './HistoryList';
import StatusMessage from './StatusMessage';
import { CARD_SX } from './formStyles';
import { recordsLabel } from '../utils/courierEdit';
import { RADIUS, FONT } from '../theme';

/**
 * Historial general: los cambios de TODOS los mensajeros, cada uno con el mensajero al que pertenece. También lo usa
 * "Actualizar administrador" con sus propios textos (cada registro lleva la etiqueta de su tipo y una frase que dice a quién).
 * @param {{ history: { entries: object[], status: 'idle'|'loading'|'error', load: Function },
 *   backLabel: string, onBack: Function, title?: string, emptyMessage?: string, errorMessage?: string,
 *   showSubject?: boolean }} props `backLabel` dice a dónde se vuelve ("Volver" o "Volver a María…").
 */
export default function CourierGeneralHistoryPanel({
  history,
  backLabel,
  onBack,
  title = 'Historial general de mensajeros',
  emptyMessage = 'Todavía no hay cambios registrados en ningún mensajero.',
  errorMessage = 'No se pudo cargar el historial general. Revisa tu conexión e inténtalo de nuevo.',
  showSubject = true,
}) {
  const { entries, status, load } = history;

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'neutral.border' }}>
        <BackButton onClick={onBack}>{backLabel}</BackButton>
        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
          {title}
        </Typography>
        {status === 'idle' && (
          <Chip
            label={recordsLabel(entries.length)}
            size="small"
            sx={{ fontSize: FONT.xs, fontWeight: 600, bgcolor: 'neutral.surface', color: 'text.secondary', borderRadius: RADIUS.lg }}
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
            <StatusMessage severity="error" message={errorMessage} />
            <Button variant="outlined" onClick={load} sx={{ fontWeight: 600 }}>
              Reintentar
            </Button>
          </Box>
        )}
        {status === 'idle' && (
          <HistoryList entries={entries} showSubject={showSubject} emptyMessage={emptyMessage} />
        )}
      </Box>
    </Paper>
  );
}
