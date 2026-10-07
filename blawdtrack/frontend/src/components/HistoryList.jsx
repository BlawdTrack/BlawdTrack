import { Box, Typography } from '@mui/material';

function CourierHistoryRow({ entry }) {
  return (
    <Box
      sx={{ px: 3, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'baseline' }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#6B6560', flex: '0 0 150px' }}>{entry.when}</Typography>
      <Typography sx={{ fontSize: 14, color: '#1F2421', flex: '1 1 200px', minWidth: 0, lineHeight: 1.45 }}>{entry.text}</Typography>
      <Typography sx={{ fontSize: 12, color: '#6B6560' }}>{entry.by}</Typography>
    </Box>
  );
}

// En el historial general cada cambio indica de qué mensajero es. La fecha va a la derecha sin saltar de
// línea y el nombre se recorta si no cabe, así el diseño no depende del ancho del panel.
function GeneralHistoryRow({ entry }) {
  return (
    <Box sx={{ px: 3, py: 1.75, borderTop: '1px solid #EFEAE4' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'baseline', gap: 2 }}>
        <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: '#1F2421' }}>{entry.courierName}</Typography>
        <Typography noWrap sx={{ fontSize: 12, fontWeight: 600, color: '#6B6560' }}>{entry.when}</Typography>
      </Box>
      <Typography sx={{ fontSize: 14, color: '#1F2421', mt: 0.5, lineHeight: 1.45 }}>{entry.text}</Typography>
      <Typography sx={{ fontSize: 12, color: '#6B6560', mt: 0.25 }}>
        <span>{entry.courierDocument}</span>
        {' · '}
        <span>Por {entry.by}</span>
      </Typography>
    </Box>
  );
}

/**
 * Lista de cambios registrados (fecha, qué cambió y quién). Con `showSubject` cada fila indica además a
 * quién pertenece el cambio (historial general); sin él, es el historial de un solo elemento.
 * @param {{ entries: Array<{ id: string, when: string, text: string, by: string, courierName?: string,
 *   courierDocument?: string }>, emptyMessage: string, showSubject?: boolean }} props
 */
export default function HistoryList({ entries, emptyMessage, showSubject = false }) {
  if (entries.length === 0) {
    return <Typography sx={{ px: 3, py: 2, fontSize: 14, color: '#6B6560' }}>{emptyMessage}</Typography>;
  }

  const Row = showSubject ? GeneralHistoryRow : CourierHistoryRow;
  return entries.map((entry) => <Row key={entry.id} entry={entry} />);
}
