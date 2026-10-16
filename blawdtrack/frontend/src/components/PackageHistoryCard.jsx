import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import StatusMessage from './StatusMessage';
import { getPackageStatusDotColor, getPackageStatusMeta } from '../config/packageStatus';
import { PACKAGE_HISTORY_STATE } from '../hooks/usePackageHistory';
import { CARD_SX } from './formStyles';
import { FONT, TOUCH_TARGET, rem } from '../theme';

// Colores y medidas de la línea de tiempo descritos en el diseño: círculo de
// 12 px, conector de 2 px en beige grisáceo (#DED8CF) que pasa por el centro de
// los indicadores y no se prolonga después del último registro.
const HISTORY_LINE = '#DED8CF';
const DOT = rem(12);
const DOT_TOP = rem(5);
const CONTENT_OFFSET = `calc(${DOT} + ${rem(14)})`;
const TITLE_ID = 'package-history-title';

// Etiquetas propias de los eventos de asignación (auditoría del paquete), que no
// son estados del catálogo pero sí forman parte de la trazabilidad.
const ACTION_LABELS = {
  ASIGNAR_PAQUETE: 'Asignado',
  DESASIGNAR_PAQUETE: 'Mensajero desasignado',
};

/**
 * Fecha y hora del evento en formato local de 24 horas ("16/09/2026 · 22:19"),
 * como en el diseño del historial: es el momento real del cambio de estado.
 */
function formatHistoryTimestamp(timestamp) {
  if (!timestamp) return null;
  const when = new Date(timestamp);
  if (Number.isNaN(when.getTime())) return null;
  const date = when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} · ${time}`;
}

/**
 * Nombre descriptivo del evento. El estado inicial se presenta como "Registrado
 * como Pendiente"; las asignaciones usan su etiqueta propia y el resto, la
 * etiqueta real del estado (`newStatus`). Nunca se deduce un estado por la
 * posición del registro.
 */
function historyEntryLabel(entry, isFirst) {
  if (ACTION_LABELS[entry.action]) return ACTION_LABELS[entry.action];

  const previousUnknown = !entry.previousStatus || entry.previousStatus === 'DESCONOCIDO';
  if (isFirst && previousUnknown && entry.newStatus === 'PENDING') {
    return 'Registrado como Pendiente';
  }

  return getPackageStatusMeta(entry.newStatus).label;
}

/** Segunda línea: fecha · hora · responsable (los campos ausentes se omiten). */
function historyEntryMeta(entry) {
  return [formatHistoryTimestamp(entry.timestamp), entry.actorName || null].filter(Boolean).join(' · ');
}

/**
 * Tarjeta del historial de estados de un paquete (solo lectura): título, línea
 * divisoria y una línea de tiempo vertical con un indicador por estado, su
 * nombre y la fecha/hora y responsable cuando están disponibles.
 *
 * @param {{ state: string, entries?: Array<object>, message?: string|null,
 *   retryable?: boolean, onRetry?: Function }} props
 */
export default function PackageHistoryCard({ state, entries = [], message = null, retryable = false, onRetry }) {
  return (
    <Paper
      elevation={0}
      component="section"
      aria-labelledby={TITLE_ID}
      sx={{ ...CARD_SX, overflow: 'hidden' }}
    >
      <Box
        sx={{
          px: { xs: 2.5, md: 3.25 },
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'neutral.border',
        }}
      >
        <Typography
          id={TITLE_ID}
          component="h2"
          sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}
        >
          Historial de estados
        </Typography>
      </Box>

      <Box sx={{ px: { xs: 2.5, md: 3.25 }, py: { xs: 2, md: 2.5 } }}>
        {state === PACKAGE_HISTORY_STATE.LOADING && (
          <Box role="status" aria-live="polite" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>Cargando historial…</Typography>
          </Box>
        )}

        {state === PACKAGE_HISTORY_STATE.ERROR && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1.5 }}>
            <StatusMessage severity="error" message={message} />
            {retryable && onRetry && (
              <Button variant="outlined" onClick={onRetry} sx={{ minHeight: TOUCH_TARGET, px: 3 }}>
                Reintentar
              </Button>
            )}
          </Box>
        )}

        {state === PACKAGE_HISTORY_STATE.EMPTY && (
          <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            {message || 'No hay historial de estados disponible para este paquete.'}
          </Typography>
        )}

        {state === PACKAGE_HISTORY_STATE.SUCCESS && entries.length > 0 && (
          <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {entries.map((entry, index) => {
              const isLast = index === entries.length - 1;
              const meta = historyEntryMeta(entry);

              return (
                <Box
                  component="li"
                  key={`${entry.timestamp ?? 'sin-fecha'}-${entry.action ?? 'evento'}-${index}`}
                  sx={{ position: 'relative', pl: CONTENT_OFFSET, pb: isLast ? 0 : 3 }}
                >
                  {!isLast && (
                    <Box
                      aria-hidden
                      sx={{
                        position: 'absolute',
                        left: `calc(${DOT} / 2)`,
                        top: `calc(${DOT_TOP} + ${DOT})`,
                        bottom: 0,
                        width: '2px',
                        transform: 'translateX(-50%)',
                        bgcolor: HISTORY_LINE,
                      }}
                    />
                  )}
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: DOT_TOP,
                      width: DOT,
                      height: DOT,
                      borderRadius: '50%',
                      bgcolor: getPackageStatusDotColor(entry.newStatus),
                      zIndex: 1,
                    }}
                  />
                  <Typography
                    sx={{ fontSize: FONT.lg, fontWeight: 600, color: '#333333', lineHeight: 1.4, wordBreak: 'break-word' }}
                  >
                    {historyEntryLabel(entry, index === 0)}
                  </Typography>
                  {meta && (
                    <Typography
                      sx={{ fontSize: FONT.sm, color: '#777777', lineHeight: 1.4, mt: 0.25, wordBreak: 'break-word' }}
                    >
                      {meta}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
}
