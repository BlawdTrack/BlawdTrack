import { Paper, Typography } from '@mui/material';
import DeliveryPhoto from './DeliveryPhoto';
import { CARD_SX } from './formStyles';
import { buildReceiptSummary, findDeliveredTimestamp, formatProofTimestamp } from '../utils/deliveryProof';
import { FONT } from '../theme';

const TITLE_ID = 'package-proof-title';

/**
 * Tarjeta "Comprobante de entrega" de la pantalla de consulta (solo lectura).
 * Muestra la fotografía real registrada para la entrega del paquete consultado
 * (`deliveryPhotoUrl` del `PackageDetailResponse`, única fuente cuando el
 * estado es ENTREGADO) y el resumen de la recepción.
 *
 * La evidencia se obtiene de la misma consulta del paquete, sin llamadas
 * adicionales al backend. El componente no permite cargar ni reemplazar nada:
 * el registro de la fotografía forma parte del flujo del mensajero, no de esta
 * pantalla. Si el paquete cambia al consultar otro número de envío, la tarjeta
 * se vuelve a derivar por completo del nuevo `pkg`.
 */
export default function PackageProofCard({ pkg, entries = [] }) {
  const isDelivered = pkg?.status === 'DELIVERED';
  const photoUrl = pkg?.deliveryPhotoUrl || null;
  const hasSignature = Boolean(pkg?.deliverySignatureUrl);
  const deliveredAt = formatProofTimestamp(findDeliveredTimestamp(entries));

  return (
    <Paper
      elevation={0}
      component="section"
      aria-labelledby={TITLE_ID}
      sx={{ ...CARD_SX, width: '100%', p: { xs: 2.5, md: 3.25 } }}
    >
      <Typography
        id={TITLE_ID}
        component="h2"
        sx={{
          fontSize: FONT.xs,
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: 'text.secondary',
          textTransform: 'uppercase',
          mb: 2,
        }}
      >
        COMPROBANTE DE ENTREGA
      </Typography>

      {!isDelivered && (
        <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.5 }}>
          El paquete aún no registra una entrega completada.
        </Typography>
      )}

      {isDelivered && (
        <>
          <DeliveryPhoto photoUrl={photoUrl} shipmentNumber={pkg?.shipmentNumber} />

          <Typography
            sx={{
              fontSize: FONT.md,
              color: 'text.primary',
              lineHeight: 1.5,
              mt: 2,
              wordBreak: 'break-word',
            }}
          >
            {buildReceiptSummary(deliveredAt, hasSignature)}
          </Typography>
        </>
      )}
    </Paper>
  );
}
