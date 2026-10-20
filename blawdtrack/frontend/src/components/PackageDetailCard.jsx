import { Box, Link, Paper, Typography } from '@mui/material';
import BrandLogo from './BrandLogo';
import MapLinkButton from './MapLinkButton';
import { LABEL_SX } from './formStyles';
import { getPackageStatusMeta } from '../config/packageStatus';
import { splitAddressLink } from '../utils/addressLink';
import { CARD_PATTERN_SX, FONT, RADIUS, rem } from '../theme';

const NO_DISPONIBLE = 'No disponible';

// Estilo del valor principal de cada bloque y de la línea secundaria. Se usan
// los tokens del tema en vez de grises sueltos.
const VALUE_SX = { fontSize: FONT.lg, color: 'text.primary', lineHeight: 1.4, wordBreak: 'break-word' };
const SECONDARY_SX = { fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.4, mt: 0.25, wordBreak: 'break-word' };

/** Bloque de datos con la jerarquía etiqueta → valor → información secundaria. */
function InfoBlock({ label, sx, children }) {
  return (
    <Box component="section" sx={sx}>
      <Typography component="h3" sx={LABEL_SX}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/** Dirección de entrega: el texto y, si traía pegado un enlace de Waze o Maps, un botón que lo abre. */
function AddressValue({ address }) {
  const { text, link } = splitAddressLink(address);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {(text || !link) && <Typography sx={VALUE_SX}>{text || NO_DISPONIBLE}</Typography>}
      {link && <MapLinkButton link={link} />}
    </Box>
  );
}

/** Cantidad sin ceros decimales innecesarios (2.000 → "2"). */
function formatQuantity(quantity) {
  const value = Number(quantity);
  return Number.isFinite(value) ? value.toLocaleString('es-CR') : String(quantity ?? '');
}

/** Precio con separador de miles local. El backend no expone moneda, así que no se antepone ningún símbolo. */
function formatUnitPrice(unitPrice) {
  const value = Number(unitPrice);
  return Number.isFinite(value) ? value.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;
}

/** Mensajero asignado: su nombre y, debajo, su teléfono y horario; o aviso de que aún no hay uno. */
function CourierBlock({ courier }) {
  const detail = courier ? [courier.phone, courier.schedule].filter(Boolean).join(' · ') : '';

  return (
    <InfoBlock label="Mensajero asignado">
      {courier ? (
        <>
          <Typography sx={VALUE_SX} data-testid="package-courier-name">{courier.fullName || NO_DISPONIBLE}</Typography>
          {detail && <Typography sx={SECONDARY_SX}>{detail}</Typography>}
        </>
      ) : (
        <Typography sx={VALUE_SX} data-testid="package-courier-name">Sin mensajero asignado</Typography>
      )}
    </InfoBlock>
  );
}

/** Artículos del paquete: nombre y, debajo, cantidad, SKU y precio unitario cuando existen. */
function ItemsBlock({ items }) {
  return (
    <InfoBlock label="Artículos" sx={{ gridColumn: { md: '1 / -1' } }}>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {items.map((item, index) => {
          const unitPrice = formatUnitPrice(item.unitPrice);
          const detail = [
            `Cantidad: ${formatQuantity(item.quantity)}`,
            item.sku ? `SKU ${item.sku}` : null,
            unitPrice ? `Precio unitario: ${unitPrice}` : null,
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <Box component="li" key={item.itemId ?? `${item.name}-${index}`}>
              <Typography sx={VALUE_SX}>{item.name || NO_DISPONIBLE}</Typography>
              <Typography sx={SECONDARY_SX}>{detail}</Typography>
            </Box>
          );
        })}
      </Box>
    </InfoBlock>
  );
}

/** Evidencia de entrega (firma, foto, comprobante). El backend solo la devuelve cuando el estado es DELIVERED. */
function EvidenceBlock({ pkg }) {
  const links = [
    { label: 'Firma', url: pkg.deliverySignatureUrl },
    { label: 'Foto', url: pkg.deliveryPhotoUrl },
    { label: 'Comprobante', url: pkg.deliveryEvidenceUrl },
  ].filter((entry) => Boolean(entry.url));

  return (
    <InfoBlock label="Evidencia de entrega" sx={{ gridColumn: { md: '1 / -1' } }}>
      {links.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 0.25 }}>
          {links.map((entry) => (
            <Link key={entry.label} href={entry.url} target="_blank" rel="noopener noreferrer" sx={{ fontSize: FONT.md, fontWeight: 600 }}>
              {entry.label}
            </Link>
          ))}
        </Box>
      ) : (
        <Typography sx={VALUE_SX}>Sin evidencia registrada</Typography>
      )}
    </InfoBlock>
  );
}

/**
 * Ficha de consulta de un paquete (solo lectura): encabezado verde con el
 * número de envío, la orden y el estado real, y un cuerpo blanco en dos
 * columnas con cliente, dirección, horario de preferencia, mensajero asignado,
 * artículos y (si el paquete está entregado) la evidencia de entrega.
 *
 * Todos los datos vienen del `PackageDetailResponse` del backend; los campos
 * opcionales sin información se muestran como "No disponible" / "No
 * especificado" en vez de inventar valores.
 *
 * @param {{ pkg: object, actions?: import('react').ReactNode }} props `pkg` es el detalle devuelto por el
 *   backend; `actions`, si se pasa, se muestra al pie de la ficha (por ejemplo, el botón "Eliminar" de HU-012).
 */
export default function PackageDetailCard({ pkg, actions = null }) {
  const status = getPackageStatusMeta(pkg.status);
  const items = Array.isArray(pkg.items) ? pkg.items : [];

  const orderLine = pkg.orderNumber ? `Orden ${pkg.orderNumber}` : 'Orden no disponible';

  return (
    <Paper
      elevation={0}
      component="section"
      aria-label={`Ficha del paquete ${pkg.shipmentNumber}`}
      data-testid="package-detail-card"
      sx={{ ...CARD_PATTERN_SX, borderRadius: RADIUS.md, overflow: 'hidden', boxShadow: 1, border: '1px solid', borderColor: 'neutral.border' }}
    >
      {/* Cabecera verde */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: { xs: 2.5, md: 3.25 },
          py: { xs: 2, md: 2.5 },
          minHeight: { md: rem(95) },
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 2,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: '1 1 auto', minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: '9px',
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <BrandLogo variant="isologo" sx={{ width: 30, p: 0 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              sx={{ fontSize: { xs: FONT.h3, md: FONT.h3 }, fontWeight: 700, lineHeight: 1.2, wordBreak: 'break-word' }}
            >
              {pkg.shipmentNumber}
            </Typography>
            <Typography sx={{ fontSize: FONT.md, color: 'primary.contrastText', opacity: 0.82, mt: 0.25, wordBreak: 'break-word' }}>
              {orderLine}
            </Typography>
          </Box>
        </Box>

        <Box
          component="span"
          sx={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            px: 1.75,
            py: 1,
            borderRadius: RADIUS.lg,
            bgcolor: status.bgcolor,
            color: status.color,
            fontSize: FONT.xs,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {status.label}
        </Box>
      </Box>

      {/* Cuerpo blanco: dos columnas en escritorio, una en móvil */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          columnGap: 4,
          rowGap: 3,
          p: { xs: 2.5, md: 3.25 },
        }}
      >
        <InfoBlock label="Cliente">
          <Typography sx={VALUE_SX}>{pkg.customerName || NO_DISPONIBLE}</Typography>
          {pkg.phone && <Typography sx={SECONDARY_SX}>{pkg.phone}</Typography>}
        </InfoBlock>

        <InfoBlock label="Dirección de entrega">
          <AddressValue address={pkg.address} />
        </InfoBlock>

        <InfoBlock label="Horario de preferencia">
          <Typography sx={VALUE_SX}>{pkg.schedule || 'No especificado'}</Typography>
        </InfoBlock>

        <CourierBlock courier={pkg.assignedCourier} />

        {items.length > 0 && <ItemsBlock items={items} />}

        {pkg.status === 'DELIVERED' && <EvidenceBlock pkg={pkg} />}
      </Box>

      {actions && (
        <Box
          sx={{
            px: { xs: 2.5, md: 3.25 },
            py: 2,
            borderTop: '1px solid',
            borderColor: 'neutral.border',
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {actions}
        </Box>
      )}
    </Paper>
  );
}
