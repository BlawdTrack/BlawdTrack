import { Box, Typography } from '@mui/material';
import { FONT } from '../theme';
import { displayValue, formatPackageSchedule } from '../utils/packageFormat';
import PackageStatusBadge from './PackageStatusBadge';
import StatusRow from './StatusRow';

const COLUMN_SX = { flex: '1 1 170px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 };

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== '';

/**
 * Fila de un paquete encontrado: número de envío y orden, cliente con su dirección y teléfono, horario y estado.
 * Va dentro de un `ul` (es un elemento de lista), igual que las filas de la previsualización de la importación.
 * @param {{ pkg: object }} props
 */
export function PackageResultRow({ pkg }) {
  const schedule = formatPackageSchedule(pkg?.schedule);

  return (
    <StatusRow>
      <Box sx={{ ...COLUMN_SX, flex: '1 1 140px' }}>
        <Typography component="span" sx={{ fontSize: FONT.md, fontWeight: 700, color: 'text.primary' }}>
          {displayValue(pkg?.shipmentNumber)}
        </Typography>
        {isFilled(pkg?.orderNumber) && (
          <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            Orden {pkg.orderNumber}
          </Typography>
        )}
      </Box>

      <Box sx={COLUMN_SX}>
        <Typography component="span" sx={{ fontSize: FONT.md, color: 'text.primary' }}>
          {displayValue(pkg?.customerName)}
        </Typography>
        <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary', overflowWrap: 'anywhere' }}>
          {displayValue(pkg?.address)}
        </Typography>
        {isFilled(pkg?.phone) && (
          <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
            {pkg.phone}
          </Typography>
        )}
      </Box>

      <Box sx={COLUMN_SX}>
        <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary' }}>
          Horario: {schedule || '—'}
        </Typography>
      </Box>

      <Box sx={{ ...COLUMN_SX, flex: '0 1 auto', alignItems: 'flex-start' }}>
        <PackageStatusBadge status={pkg?.status} />
      </Box>
    </StatusRow>
  );
}

export default PackageResultRow;
