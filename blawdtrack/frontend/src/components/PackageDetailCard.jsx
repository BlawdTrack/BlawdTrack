import { Box, Paper, Typography } from '@mui/material';
import BrandLogo from './BrandLogo';
import { LABEL_SX } from './formStyles';
import { getPackageStatusMeta } from '../utils/packageStatus';
import { formatDateTime } from '../utils/dates';
import { CARD_PATTERN_SX, FONT, RADIUS, rem } from '../theme';

const NO_DISPONIBLE = 'No disponible';

// Estilo del valor principal de cada bloque y de la línea secundaria.
const VALUE_SX = { fontSize: FONT.lg, color: '#333333', lineHeight: 1.4, wordBreak: 'break-word' };
const SECONDARY_SX = { fontSize: FONT.md, color: '#777777', lineHeight: 1.4, mt: 0.25, wordBreak: 'break-word' };

/** Bloque de datos con la jerarquía etiqueta → valor → información secundaria. */
function InfoBlock({ label, children }) {
  return (
    <Box component="section">
      <Typography component="h3" sx={LABEL_SX}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

/**
 * Ficha de consulta de un paquete (solo lectura): encabezado verde con el
 * número de envío, la orden y el estado real, y un cuerpo blanco en dos
 * columnas con cliente, dirección, horario de preferencia y mensajero asignado.
 *
 * Todos los datos vienen del `PackageDetailResponse` del backend; los campos
 * opcionales sin información se muestran como "No disponible" / "No
 * especificado" en vez de inventar valores.
 *
 * @param {{ pkg: object }} props Detalle devuelto por el backend.
 */
export default function PackageDetailCard({ pkg }) {
  const status = getPackageStatusMeta(pkg.status);
  const courier = pkg.assignedCourier;

  // La fecha/hora de importación no forma parte del contrato actual
  // (`PackageDetailResponse` no la expone); si el backend llega a añadirla, se
  // muestra aquí sin cambiar el resto de la ficha.
  const importedAt = pkg.importedAt ?? pkg.importDate ?? pkg.createdAt ?? null;
  const orderLine = pkg.orderNumber ? `Orden ${pkg.orderNumber}` : 'Orden no disponible';
  const importLine = importedAt ? ` · importado ${formatDateTime(importedAt)}` : '';

  const courierDetail = courier
    ? [courier.phone, courier.schedule].filter(Boolean).join(' · ')
    : '';

  return (
    <Paper
      elevation={0}
      component="section"
      aria-label={`Ficha del paquete ${pkg.shipmentNumber}`}
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
            <Typography sx={{ fontSize: FONT.md, color: 'rgba(255,255,255,0.82)', mt: 0.25, wordBreak: 'break-word' }}>
              {orderLine}
              {importLine}
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
          <Typography sx={VALUE_SX}>{pkg.address || NO_DISPONIBLE}</Typography>
        </InfoBlock>

        <InfoBlock label="Horario de preferencia">
          <Typography sx={VALUE_SX}>{pkg.schedule || 'No especificado'}</Typography>
        </InfoBlock>

        <InfoBlock label="Mensajero asignado">
          {courier ? (
            <>
              <Typography sx={VALUE_SX}>{courier.fullName || NO_DISPONIBLE}</Typography>
              {courierDetail && <Typography sx={SECONDARY_SX}>{courierDetail}</Typography>}
            </>
          ) : (
            <Typography sx={VALUE_SX}>Sin mensajero asignado</Typography>
          )}
        </InfoBlock>
      </Box>
    </Paper>
  );
}
