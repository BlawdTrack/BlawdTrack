import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import { CARD_SX } from './formStyles';
import { FONT, RADIUS, TOUCH_TARGET } from '../theme';

const TITLE_ID = 'package-proof-title';

// Medidas tomadas de la referencia visual: la tarjeta se mantiene compacta en
// escritorio (≈350 px) y toma el ancho disponible en pantallas pequeñas sin
// desbordarse. El área de la fotografía conserva una proporción cercana a 1.7:1
// para que la evidencia sea reconocible sin dominar la ficha.
const CARD_MAX_WIDTH = 350;
const PHOTO_MAX_WIDTH = 300;
const PHOTO_RATIO = '300 / 176';

// Estados de la fotografía dentro de su contenedor.
const PHOTO_STATE = { LOADING: 'loading', READY: 'ready', ERROR: 'error' };

// Fondo beige grisáceo y borde fino del área de la fotografía (los mismos tonos
// neutros cálidos que usa el resto de la pantalla).
const PHOTO_FRAME_SX = {
  position: 'relative',
  width: '100%',
  maxWidth: PHOTO_MAX_WIDTH,
  aspectRatio: PHOTO_RATIO,
  bgcolor: 'neutral.surface',
  border: '1px solid',
  borderColor: 'neutral.border',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
};

/**
 * Fecha y hora de la entrega en formato local de 24 horas, el mismo que usa el
 * historial de estados. Devuelve `null` cuando no hay timestamp utilizable.
 */
function formatProofTimestamp(timestamp) {
  if (!timestamp) return null;
  const when = new Date(timestamp);
  if (Number.isNaN(when.getTime())) return null;
  const date = when.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = when.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} a las ${time}`;
}

/**
 * Busca en el historial el registro real del paso a ENTREGADO. El historial
 * llega ordenado cronológicamente, así que se toma la última entrada con ese
 * estado (la entrega definitiva). Nunca se deduce por posición ni por la
 * fecha actual.
 */
function findDeliveredTimestamp(entries) {
  if (!Array.isArray(entries)) return null;
  for (let index = entries.length - 1; index >= 0; index -= 1) {
    const entry = entries[index];
    if (entry?.newStatus === 'DELIVERED' && entry?.timestamp) return entry.timestamp;
  }
  return null;
}

/**
 * Texto complementario de la entrega, construido solo con datos reales del
 * backend: la fecha del historial y la existencia de una firma registrada (el
 * backend la expone como `deliverySignatureUrl`; sin ese campo no se afirma
 * nada). El backend todavía no expone el nombre de la persona que recibió el
 * paquete, por lo que no se muestra un "Recibido por" inventado.
 */
function buildReceiptSummary(deliveredAt, hasSignature) {
  const parts = [];
  if (deliveredAt) parts.push(`Entrega registrada el ${deliveredAt}.`);
  parts.push(
    hasSignature
      ? 'Firma digital registrada al cierre de la entrega.'
      : 'Sin firma digital registrada.'
  );
  return parts.join(' ');
}

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

  const [photoState, setPhotoState] = useState(PHOTO_STATE.LOADING);
  const [retryNonce, setRetryNonce] = useState(0);

  // Al llegar una fotografía distinta (otra consulta) o al reintentar, el
  // contenedor vuelve a su estado de carga y la imagen se vuelve a pedir.
  useEffect(() => {
    setPhotoState(PHOTO_STATE.LOADING);
  }, [photoUrl, retryNonce]);

  const handleRetry = () => setRetryNonce((nonce) => nonce + 1);

  return (
    <Paper
      elevation={0}
      component="section"
      aria-labelledby={TITLE_ID}
      sx={{ ...CARD_SX, width: '100%', maxWidth: CARD_MAX_WIDTH, p: { xs: 2.5, md: 3.75 } }}
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
          <Box sx={PHOTO_FRAME_SX}>
            {/* Sin fotografía registrada: marcador de posición explícito, que no
                afirma que exista evidencia fotográfica. */}
            {photoUrl === null && (
              <Box sx={{ px: 2, textAlign: 'center' }}>
                <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.5 }}>
                  Fotografía de la entrega
                </Typography>
                <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.5 }}>
                  (cargada por el mensajero)
                </Typography>
              </Box>
            )}

            {/* La fotografía está registrada pero no pudo recuperarse: se
                conserva el espacio y se diferencia de la ausencia real. */}
            {photoUrl !== null && photoState === PHOTO_STATE.ERROR && (
              <Box
                sx={{
                  px: 2,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.5 }}>
                  No fue posible cargar la fotografía de la entrega. Inténtalo de nuevo.
                </Typography>
                <Button variant="outlined" onClick={handleRetry} sx={{ minHeight: TOUCH_TARGET, px: 3 }}>
                  Reintentar
                </Button>
              </Box>
            )}

            {photoUrl !== null && photoState !== PHOTO_STATE.ERROR && (
              <Box
                component="img"
                key={retryNonce}
                src={photoUrl}
                alt={`Fotografía de la entrega del paquete ${pkg?.shipmentNumber ?? ''}`.trim()}
                onLoad={() => setPhotoState(PHOTO_STATE.READY)}
                onError={() => setPhotoState(PHOTO_STATE.ERROR)}
                sx={{
                  width: '100%',
                  height: '100%',
                  // `contain` para que la evidencia se vea completa y reconocible.
                  objectFit: 'contain',
                  display: photoState === PHOTO_STATE.READY ? 'block' : 'none',
                }}
              />
            )}

            {photoUrl !== null && photoState === PHOTO_STATE.LOADING && (
              <Box
                role="status"
                aria-label="Cargando la fotografía de la entrega"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CircularProgress size={20} aria-hidden />
              </Box>
            )}
          </Box>

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
