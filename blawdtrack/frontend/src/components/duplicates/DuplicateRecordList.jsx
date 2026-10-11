import { Box, Paper, Typography } from '@mui/material';
import DuplicateRecordRow from './DuplicateRecordRow';
import { CARD_SX } from '../formStyles';
import { FONT } from '../../theme';

/**
 * Tarjeta "Registros duplicados": un encabezado con la cantidad y una fila resaltada por cada número de envío.
 * @param {{ duplicates: Array<{ shipmentNumber: string, customerName: string|null, address: string|null,
 *   note: string }> }} props Duplicados del reporte de `buildDuplicateReport`.
 */
export default function DuplicateRecordList({ duplicates }) {
  return (
    <Paper component="section" aria-labelledby="duplicate-records-title" elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography id="duplicate-records-title" component="h2" sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: FONT.lg, color: 'primary.main' }}>
          Registros duplicados
        </Typography>
      </Box>
      <Box component="ul" sx={{ m: 0, p: 0 }}>
        {duplicates.map((record) => (
          <DuplicateRecordRow key={record.shipmentNumber} record={record} />
        ))}
      </Box>
    </Paper>
  );
}
