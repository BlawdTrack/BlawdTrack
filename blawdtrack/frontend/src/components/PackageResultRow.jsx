import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';
import { packageDetailPath } from '../config/routes';
import { FONT } from '../theme';
import { splitAddressLink } from '../utils/addressLink';
import { displayValue, formatPackageSchedule } from '../utils/packageFormat';
import MapLinkButton from './MapLinkButton';
import PackageRowActions from './packages/PackageRowActions';
import { PACKAGE_LIST_GRID_SX } from './packages/packageListGrid';
import PackageStatusBadge from './PackageStatusBadge';

const CELL_SX = { minWidth: 0, fontSize: FONT.md, color: 'text.primary', py: { xs: 0.25, md: 1.25 } };
const CLAMP_SX = { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: { md: 2 }, overflow: 'hidden', overflowWrap: 'anywhere', lineHeight: 1.35 };
// En el celular las filas se apilan sin encabezado de columnas: el teléfono y el horario llevan su nombre delante.
const mobileLabel = (text) => ({ '&::before': { content: `"${text}"`, display: { md: 'none' }, color: 'text.secondary' } });

const isFilled = (value) => value !== null && value !== undefined && String(value).trim() !== '';

/** Dirección: el texto y, si traía pegado un enlace de Waze o Maps, un botón que lo abre. */
function Address({ address }) {
  const { text, link } = splitAddressLink(address);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: link && text ? 0.5 : 0 }}>
      {(text || !link) && (
        <Box component="span" title={text || undefined} sx={CLAMP_SX}>
          {link ? text : displayValue(address)}
        </Box>
      )}
      {link && <MapLinkButton link={link} />}
    </Box>
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
    <Link
      component={RouterLink}
      to={packageDetailPath(shipmentNumber)}
      underline="hover"
      // La fila entera abre la ficha; el enlace conserva el acceso con teclado y no la abre dos veces.
      onClick={(event) => event.stopPropagation()}
      sx={sx}
    >
      {text}
    </Link>
  );
}

/** Número de orden bajo el de envío, si la fila lo trae. */
function OrderLine({ orderNumber }) {
  if (!isFilled(orderNumber)) return null;
  return (
    <Typography component="span" sx={{ display: 'block', fontSize: FONT.sm, color: 'text.secondary' }}>
      Orden {orderNumber}
    </Typography>
  );
}

/** Celda de un dato corto (teléfono, horario): en el celular lleva su nombre delante si tiene valor. */
function LabeledCell({ label, value, nowrap = false }) {
  return (
    <Box sx={{ ...CELL_SX, ...(nowrap && { whiteSpace: { md: 'nowrap' } }), ...(isFilled(value) && mobileLabel(label)) }}>
      {displayValue(value)}
    </Box>
  );
}

/**
 * Fila de un paquete en la tabla de "Consultar paquetes": estado, número de envío (enlace a la ficha) y de orden,
 * cliente, dirección (con un botón Waze/Maps si traía un enlace), teléfono, horario y las acciones (Eliminar y la
 * flecha). Toda la fila abre la ficha con un clic; el enlace del número de envío es el acceso con teclado. Se dibuja
 * como elemento de lista: va dentro de un `ul`.
 * @param {{ pkg: object, onOpen?: (pkg: object) => void, onDelete?: (pkg: object) => void,
 *   onBlocked?: (pkg: object) => void }} props
 */
export function PackageResultRow({ pkg, onOpen, onDelete, onBlocked }) {
  const schedule = formatPackageSchedule(pkg?.schedule);
  const clickable = Boolean(onOpen) && isFilled(pkg?.shipmentNumber);

  return (
    <Box
      component="li"
      data-testid="package-result-row"
      onClick={clickable ? () => onOpen(pkg) : undefined}
      sx={{
        ...PACKAGE_LIST_GRID_SX,
        listStyle: 'none',
        py: { xs: 1.25, md: 0 },
        minHeight: 56,
        borderBottom: '1px solid',
        borderColor: 'neutral.border',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': { bgcolor: 'neutral.surface' },
      }}
    >
      <Box sx={CELL_SX}>
        <PackageStatusBadge status={pkg?.status} />
      </Box>

      <Box sx={CELL_SX}>
        <ShipmentNumber shipmentNumber={pkg?.shipmentNumber} />
        <OrderLine orderNumber={pkg?.orderNumber} />
      </Box>

      <Box sx={{ ...CELL_SX, overflowWrap: 'anywhere' }}>{displayValue(pkg?.customerName)}</Box>
      <Box sx={CELL_SX}><Address address={pkg?.address} /></Box>
      <LabeledCell label="Tel. " value={pkg?.phone} nowrap />
      <LabeledCell label="Horario: " value={schedule} />
      <PackageRowActions pkg={pkg} onDelete={onDelete ?? (() => {})} onBlocked={onBlocked} />
    </Box>
  );
}

export default PackageResultRow;
