import { Box, Link, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BrandLogo from './BrandLogo';
import HelpTip from './HelpTip';
import PackageProgress from './PackageProgress';
import MapLinkButton from './MapLinkButton';
import { CARD_SX, LABEL_SX } from './formStyles';
import { getPackageStatusMeta } from '../config/packageStatus';
import { splitAddressLink } from '../utils/addressLink';
import { FONT, RADIUS, rem } from '../theme';

const NO_DISPONIBLE = 'No disponible';

// Estilo del valor principal de cada bloque y de la línea secundaria. Se usan
// los tokens del tema en vez de grises sueltos.
const VALUE_SX = { fontSize: FONT.lg, color: 'text.primary', lineHeight: 1.4, wordBreak: 'break-word' };
const SECONDARY_SX = { fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.4, mt: 0.25, wordBreak: 'break-word' };

/** Fila de datos: la etiqueta a la izquierda y, a su derecha, el valor con su información secundaria. */
function InfoBlock({ label, children }) {
  return (
    <Box
      component="section"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: `${rem(150)} 1fr` },
        columnGap: 1.5,
        rowGap: 0.25,
        py: 1.75,
        borderBottom: '1px solid',
        borderColor: 'neutral.border',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Typography component="h3" sx={{ ...LABEL_SX, mb: 0, pt: 0.4 }}>
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
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
    <InfoBlock label="Artículos">
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
    <InfoBlock label="Evidencia de entrega">
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
 * Ficha de consulta de un paquete (solo lectura): encabezado verde con el número de envío, la orden y el estado real,
 * el avance del paquete, la tarjeta "Datos de la entrega" (cliente, dirección, horario, mensajero, artículos y, si está
 * entregado, la evidencia) y, al lado, lo que se pase en `aside` (el seguimiento). Al pie, si hay `actions`, la zona
 * para eliminar el paquete.
 *
 * Todos los datos vienen del `PackageDetailResponse` del backend; los campos opcionales sin información se muestran
 * como "No disponible" / "No especificado" en vez de inventar valores.
 *
 * @param {{ pkg: object, actions?: import('react').ReactNode, notice?: string, aside?: import('react').ReactNode }} props
 *   `pkg` es el detalle devuelto por el backend; `actions`, si se pasa, se muestra en la zona "Eliminar paquete" (por
 *   ejemplo, el botón de HU-012); `notice`, si se pasa, es una leyenda que se abre desde un ! junto al número de envío;
 *   `aside` es el contenido de la columna derecha (historial y comprobante).
 */
export default function PackageDetailCard({ pkg, actions = null, notice = null, aside = null }) {
  const status = getPackageStatusMeta(pkg.status);
  const items = Array.isArray(pkg.items) ? pkg.items : [];

  const orderLine = pkg.orderNumber ? `Orden ${pkg.orderNumber}` : 'Orden no disponible';

  return (
    <Box
      component="section"
      aria-label={`Ficha del paquete ${pkg.shipmentNumber}`}
      data-testid="package-detail-card"
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      {/* Cabecera verde */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: RADIUS.lg,
          borderBottom: '5px solid',
          borderBottomColor: 'secondary.main',
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2, md: 2.5 },
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          columnGap: 2.5,
          rowGap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flex: '1 1 auto', minWidth: 0 }}>
          <Box
            sx={{
              width: rem(46),
              height: rem(46),
              flexShrink: 0,
              borderRadius: RADIUS.md,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <BrandLogo variant="isologo" sx={{ width: rem(36), p: 0 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                component="h2"
                sx={{ fontFamily: 'Poppins', fontSize: FONT.h2, fontWeight: 600, lineHeight: 1.2, wordBreak: 'break-word' }}
              >
                {pkg.shipmentNumber}
              </Typography>
              {notice && (
                <HelpTip label="Aviso sobre la ficha" icon={ErrorOutlineIcon} sx={{ color: 'inherit', my: -1, ml: -0.5, '& svg': { fontSize: rem(22) } }}>
                  {notice}
                </HelpTip>
              )}
            </Box>
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
            px: 2.25,
            py: 1,
            borderRadius: RADIUS.lg,
            bgcolor: status.bgcolor,
            color: status.color,
            fontSize: FONT.md,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {status.label}
        </Box>
      </Box>

      <PackageProgress status={pkg.status} />

      {/* Datos de la entrega a la izquierda y el seguimiento a la derecha; en móvil, uno bajo el otro. */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: aside ? '1.2fr 0.8fr' : '1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Paper elevation={0} component="section" aria-labelledby="package-data-title" sx={{ ...CARD_SX, overflow: 'hidden' }}>
          <Typography
            id="package-data-title"
            component="h2"
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: FONT.lg,
              color: 'primary.main',
              px: { xs: 2.5, md: 3.25 },
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'neutral.border',
            }}
          >
            Datos de la entrega
          </Typography>
          <Box sx={{ px: { xs: 2.5, md: 3.25 }, py: 0.75 }}>
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
        </Paper>

        {aside && <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>{aside}</Box>}
      </Box>

      {actions && (
        <Paper
          elevation={0}
          component="section"
          aria-label="Eliminar paquete"
          sx={{
            ...CARD_SX,
            borderColor: 'error.main',
            bgcolor: 'error.light',
            px: { xs: 2.5, md: 3.25 },
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: FONT.lg, fontWeight: 700, color: 'error.text' }}>Eliminar paquete</Typography>
            <Typography sx={{ fontSize: FONT.sm, color: 'error.text' }}>
              Solo se puede eliminar un paquete que aún no fue despachado (Pendiente o Asignado).
            </Typography>
          </Box>
          {actions}
        </Paper>
      )}
    </Box>
  );
}
