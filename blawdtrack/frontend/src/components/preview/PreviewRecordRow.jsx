import { Box, Typography } from '@mui/material';
import PackageStatusChip from '../PackageStatusChip';
import StatusRow from '../StatusRow';
import { PREVIEW_STATUS } from '../../utils/importPreview';
import { FONT } from '../../theme';

// Cómo se resalta y se etiqueta cada resultado: tono de la fila, etiqueta y color de las notas.
const BY_STATUS = {
  [PREVIEW_STATUS.VALID]: { tone: 'none', chip: 'valid', noteColor: 'text.secondary' },
  [PREVIEW_STATUS.INVALID]: { tone: 'error', chip: 'error', noteColor: 'error.text' },
  [PREVIEW_STATUS.DUPLICATE]: { tone: 'warning', chip: 'duplicate', noteColor: 'warning.text' },
};

const COLUMN_SX = { flex: '1 1 170px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 };

/**
 * Fila de un registro del archivo en la previsualización: número de envío y orden, cliente, dirección y teléfono,
 * horario y rango de entrega calculado (solo en los válidos) y su resultado con las notas. Los registros con
 * errores y los duplicados van resaltados, y el resultado lleva siempre su etiqueta con texto.
 * @param {{ row: object }} props Fila de `buildImportPreview`.
 */
export default function PreviewRecordRow({ row }) {
  const { tone, chip, noteColor } = BY_STATUS[row.status] ?? BY_STATUS[PREVIEW_STATUS.INVALID];
  const isValid = row.status === PREVIEW_STATUS.VALID;
  const hasCustomer = row.customerName || row.address || row.phone;

  return (
    <StatusRow tone={tone}>
      <Box sx={{ ...COLUMN_SX, flex: '1 1 140px' }}>
        <Typography component="span" sx={{ fontSize: FONT.md, fontWeight: 700, color: row.shipmentNumber ? 'text.primary' : 'text.secondary' }}>
          {row.shipmentNumber ?? 'Sin número de envío'}
        </Typography>
        {row.orderNumber && (
          <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            Orden {row.orderNumber}
          </Typography>
        )}
      </Box>

      {hasCustomer && (
        <Box sx={COLUMN_SX}>
          {row.customerName && <Typography component="span" sx={{ fontSize: FONT.md, color: 'text.primary' }}>{row.customerName}</Typography>}
          {row.address && <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>{row.address}</Typography>}
          {row.phone && <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>{row.phone}</Typography>}
        </Box>
      )}

      {(row.schedule || isValid) && (
        <Box sx={COLUMN_SX}>
          {row.schedule && <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>Horario: {row.schedule}</Typography>}
          {isValid && (
            <Typography component="span" sx={{ fontSize: FONT.sm, fontWeight: 600, color: row.deliveryRange ? 'text.primary' : 'text.secondary' }}>
              Entrega: {row.deliveryRange ?? 'Sin calcular'}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ ...COLUMN_SX, flex: '1 1 200px', alignItems: 'flex-start', gap: 0.75 }}>
        <PackageStatusChip kind={chip} />
        {row.notes.map((note) => (
          <Typography key={note} component="span" sx={{ fontSize: FONT.sm, color: noteColor, lineHeight: 1.4 }}>
            {note}
          </Typography>
        ))}
      </Box>
    </StatusRow>
  );
}
