import { TableCell, TableRow, Typography } from '@mui/material';
import { FONT } from '../theme';
import { displayValue, formatPackageSchedule } from '../utils/packageFormat';
import PackageStatusBadge from './PackageStatusBadge';

/**
 * Fila de resultados para un paquete individual.
 * @param {{ pkg: object }} props
 */
export function PackageResultRow({ pkg }) {
  const shipmentNumber = displayValue(pkg?.shipmentNumber);
  const orderNumber = pkg?.orderNumber;
  const customerName = displayValue(pkg?.customerName);
  const phone = displayValue(pkg?.phone);
  const address = displayValue(pkg?.address);
  const schedule = formatPackageSchedule(pkg?.schedule) || '—';
  const hasOrderNumber = orderNumber !== null && orderNumber !== undefined && String(orderNumber).trim() !== '';
  const hasPhone = phone !== '—' && String(phone).trim() !== '';

  return (
    <TableRow
      sx={{
        '&:hover': { backgroundColor: 'neutral.surface' },
        '& td': { borderBottom: '1px solid', borderColor: 'neutral.border' },
      }}
    >
      <TableCell sx={{ py: 1.75, px: 2, verticalAlign: 'middle' }}>
        <Typography sx={{ fontWeight: 700, fontSize: FONT.md, color: 'text.primary' }}>{shipmentNumber}</Typography>
        {hasOrderNumber && (
          <Typography sx={{ mt: 0.25, fontSize: FONT.xs, color: 'text.secondary' }}>
            Orden {orderNumber}
          </Typography>
        )}
      </TableCell>

      <TableCell sx={{ py: 1.75, px: 2, verticalAlign: 'middle' }}>
        <Typography sx={{ fontWeight: 500, fontSize: FONT.md, color: 'text.primary' }}>{customerName}</Typography>
        {hasPhone && (
          <Typography sx={{ mt: 0.25, fontSize: FONT.xs, color: 'text.secondary' }}>{phone}</Typography>
        )}
      </TableCell>

      <TableCell sx={{ py: 1.75, px: 2, verticalAlign: 'middle', color: 'text.secondary' }}>
        <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', wordBreak: 'break-word' }}>{address}</Typography>
      </TableCell>

      <TableCell sx={{ py: 1.75, px: 2, verticalAlign: 'middle', color: 'text.secondary' }}>
        <Typography sx={{ fontSize: FONT.md, color: 'text.secondary' }}>{schedule}</Typography>
      </TableCell>

      <TableCell sx={{ py: 1.75, px: 2, verticalAlign: 'middle' }}>
        <PackageStatusBadge status={pkg?.status} />
      </TableCell>
    </TableRow>
  );
}

export default PackageResultRow;
