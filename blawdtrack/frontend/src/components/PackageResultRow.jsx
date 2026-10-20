import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';
import { packageDetailPath } from '../config/routes';
import { FONT } from '../theme';
import { splitAddressLink } from '../utils/addressLink';
import { displayValue, formatPackageSchedule } from '../utils/packageFormat';
import MapLinkButton from './MapLinkButton';
import PackageStatusBadge from './PackageStatusBadge';
import StatusRow from './StatusRow';

const COLUMN_SX = { flex: '1 1 170px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.25 };

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== '';

/** Dirección: el texto y, si traía pegado un enlace de Waze o Maps, un botón que lo abre. */
function Address({ address }) {
  const { text, link } = splitAddressLink(address);

  return (
    <>
      {(text || !link) && (
        <Typography component="span" sx={{ fontSize: FONT.sm, color: 'text.secondary', overflowWrap: 'anywhere' }}>
          {link ? text : displayValue(address)}
        </Typography>
      )}
      {link && <MapLinkButton link={link} />}
    </>
  );
}

/** Número de envío: enlace a la ficha del paquete (HU-013), o texto si la fila no trae número. */
function ShipmentNumber({ shipmentNumber }) {
  const text = displayValue(shipmentNumber);
  const sx = { fontSize: FONT.md, fontWeight: 700 };

  if (!isFilled(shipmentNumber)) {
    return <Typography component="span" sx={{ ...sx, color: 'text.primary' }}>{text}</Typography>;
  }
  return (
    <Link component={RouterLink} to={packageDetailPath(shipmentNumber)} underline="hover" sx={sx}>
      {text}
    </Link>
  );
}

/**
 * Fila de un paquete encontrado: número de envío y orden, cliente con su dirección y teléfono, horario y estado.
 * El número de envío lleva a la ficha del paquete. Va dentro de un `ul` (es un elemento de lista), igual que las
 * filas de la previsualización de la importación.
 * @param {{ pkg: object }} props
 */
export function PackageResultRow({ pkg }) {
  const schedule = formatPackageSchedule(pkg?.schedule);

  return (
    <StatusRow testId="package-result-row">
      <Box sx={{ ...COLUMN_SX, flex: '1 1 140px' }}>
        <ShipmentNumber shipmentNumber={pkg?.shipmentNumber} />
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
        <Address address={pkg?.address} />
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
