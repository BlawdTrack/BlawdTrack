import { useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { FONT, TOUCH_TARGET } from '../theme';

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
 * Fotografía de la entrega dentro de su marco: marcador de posición si no hay ninguna registrada, error con
 * "Reintentar" si está registrada pero no pudo recuperarse, y la imagen (con su indicador de carga) en los demás casos.
 * @param {{ photoUrl: string|null, shipmentNumber?: string }} props
 */
export function DeliveryPhoto({ photoUrl, shipmentNumber }) {
  const [photoStatus, setPhotoStatus] = useState({ key: photoUrl, status: PHOTO_STATE.LOADING });
  const [retryNonce, setRetryNonce] = useState(0);

  // La clave de render agrupa la fotografía actual (URL + intento). Si cambia la
  // URL (otra consulta) o se reintenta, se parte de un estado de carga limpio
  // derivado durante el render, sin efectos ni renders en cascada.
  const renderKey = `${photoUrl ?? ''}#${retryNonce}`;
  const photoState = photoStatus.key === renderKey ? photoStatus.status : PHOTO_STATE.LOADING;
  const markPhotoState = (status) => setPhotoStatus({ key: renderKey, status });

  const handleRetry = () => setRetryNonce((nonce) => nonce + 1);

  return (
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
        alt={`Fotografía de la entrega del paquete ${shipmentNumber ?? ''}`.trim()}
        onLoad={() => markPhotoState(PHOTO_STATE.READY)}
        onError={() => markPhotoState(PHOTO_STATE.ERROR)}
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
  );
}

export default DeliveryPhoto;
