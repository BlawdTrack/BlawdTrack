import { Fragment } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { RADIUS, FONT } from '../theme';

function CourierHistoryRow({ entry }) {
  return (
    <Box
      sx={{ px: 3, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', gap: '11px', flexWrap: 'wrap', alignItems: 'baseline' }}
    >
      <Typography sx={{ fontSize: FONT.xs, fontWeight: 600, color: 'text.secondary', flex: '0 0 150px' }}>{entry.when}</Typography>
      <Typography sx={{ fontSize: FONT.sm, color: '#1F2421', flex: '1 1 200px', minWidth: 0, lineHeight: 1.45 }}>{entry.text}</Typography>
      <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary' }}>{entry.by}</Typography>
    </Box>
  );
}

const BADGE_COLORS = {
  success: { bgcolor: 'success.light', color: 'success.main' },
  danger: { bgcolor: 'error.light', color: 'error.main' },
};

// En el historial general cada cambio indica de quién es. La fecha va a la derecha sin saltar de línea y el
// sujeto se recorta si no cabe, así el diseño no depende del ancho del panel.
function GeneralHistoryRow({ entry }) {
  const footer = [entry.subjectDetail, `Por ${entry.by}`].filter(Boolean);

  return (
    <Box sx={{ px: 3, py: 1.75, borderTop: '1px solid #EFEAE4' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {entry.badge && (
            <Chip
              label={entry.badge.label}
              size="small"
              sx={{ fontSize: FONT.xs, fontWeight: 700, borderRadius: RADIUS.lg, ...BADGE_COLORS[entry.badge.tone] }}
            />
          )}
          {entry.subject && (
            <Typography noWrap sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>{entry.subject}</Typography>
          )}
        </Box>
        <Typography noWrap sx={{ fontSize: FONT.xs, fontWeight: 600, color: 'text.secondary' }}>{entry.when}</Typography>
      </Box>
      <Typography sx={{ fontSize: FONT.sm, color: '#1F2421', mt: 0.5, lineHeight: 1.45 }}>{entry.text}</Typography>
      <Typography sx={{ fontSize: FONT.xs, color: 'text.secondary', mt: 0.25 }}>
        {footer.map((part, index) => (
          <Fragment key={part}>
            {index > 0 && ' · '}
            <span>{part}</span>
          </Fragment>
        ))}
      </Typography>
    </Box>
  );
}

/**
 * Lista de cambios registrados (fecha, qué cambió y quién). Con `showSubject` cada fila indica además de
 * quién o de qué es el cambio (historial general o auditoría); sin él, es el historial de un solo elemento.
 * @param {{ entries: Array<{ id: string, when: string, text: string, by: string, subject?: string,
 *   subjectDetail?: string, badge?: { label: string, tone: 'success'|'danger' } }>, emptyMessage: string,
 *   showSubject?: boolean }} props
 */
export default function HistoryList({ entries, emptyMessage, showSubject = false }) {
  if (entries.length === 0) {
    return <Typography sx={{ px: 3, py: 2, fontSize: FONT.sm, color: 'text.secondary' }}>{emptyMessage}</Typography>;
  }

  const Row = showSubject ? GeneralHistoryRow : CourierHistoryRow;
  return entries.map((entry) => <Row key={entry.id} entry={entry} />);
}
