import { Box, Typography } from '@mui/material';
import PackageStatusChip from '../PackageStatusChip';
import StatusRow from '../StatusRow';
import { FONT, rem } from '../../theme';

/**
 * Fila resaltada de un paquete duplicado: fondo y barra lateral de advertencia, el número de envío, el cliente y la
 * dirección (si el backend los envía), la etiqueta "Duplicado" y la nota con la causa. El resaltado no depende
 * solo del color: la etiqueta y la nota dicen por qué es duplicado. Se dibuja como elemento de lista.
 * @param {{ record: { shipmentNumber: string, customerName: string|null, address: string|null, note: string } }} props
 */
export default function DuplicateRecordRow({ record }) {
  const hasCustomer = Boolean(record.customerName || record.address);

  return (
    <StatusRow tone="warning">
      <Typography component="span" sx={{ fontSize: FONT.md, fontWeight: 700, color: 'text.primary', flex: `0 0 ${rem(130)}` }}>
        {record.shipmentNumber}
      </Typography>

      {hasCustomer && (
        <Box sx={{ flex: '1 1 180px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
          {record.customerName && (
            <Typography component="span" sx={{ fontSize: FONT.md, color: 'text.primary' }}>
              {record.customerName}
            </Typography>
          )}
          {record.address && (
            <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
              {record.address}
            </Typography>
          )}
        </Box>
      )}

      <PackageStatusChip kind="duplicate" />

      {record.note && (
        <Typography component="span" sx={{ fontSize: FONT.sm, color: 'warning.text', flex: '1 1 200px', lineHeight: 1.4 }}>
          {record.note}
        </Typography>
      )}
    </StatusRow>
  );
}
