import { Link as RouterLink } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { COMING_SOON_MESSAGE } from '../config/mainMenu';
import { CARD_PATTERN_SX, FONT, RADIUS, rem, fontPx } from '../theme';

// Fila ancha del menú principal: icono en cuadro a la izquierda, junto al título, y un círculo con la flecha a la
// derecha. Alto mínimo de 88 px (72 px en móvil).
const ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  textAlign: 'left',
  gap: 2.5,
  minHeight: { xs: rem(72), md: rem(88) },
  px: 3,
  py: 2.5,
  borderRadius: RADIUS.md,
};

// Icono: cuadro de 54 px (40 px en móvil) con fondo naranja suave; el icono va en naranja oscuro porque el naranja
// pleno sobre ese fondo no llega al 3:1 que se pide a un icono.
const ICON_BOX_SX = {
  flex: '0 0 auto',
  width: { xs: rem(40), md: rem(54) },
  height: { xs: rem(40), md: rem(54) },
  borderRadius: RADIUS.sm,
  bgcolor: 'secondary.light',
  color: 'secondary.text',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': { fontSize: { xs: fontPx(22), md: fontPx(30) } },
};

// Máximo dos líneas; si el texto es más largo se corta con puntos suspensivos.
const DESCRIPTION_SX = {
  fontSize: FONT.md,
  color: 'text.secondary',
  mt: 0.5,
  lineHeight: 1.5,
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
};

/**
 * Fila del menú principal: icono, título y descripción corta, con un círculo con la flecha a la derecha. Toda la
 * fila es el enlace (objetivo grande, ley de Fitts) y no cambia de tamaño ni de sitio al pasar el cursor: solo el
 * borde y el círculo. Sin `to` se muestra deshabilitada, con "Próximamente" y el aviso de que está por implementarse al pasar el cursor. Con `muted` va atenuada, con
 * borde punteado y el icono en gris (para lo que es de otra vista, como la del mensajero).
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string, description?: string,
 *   muted?: boolean }} props
 */
export default function MenuCard({ to = null, icon: Icon, title, description, muted = false }) {
  // Sin ruta es un bloque deshabilitado, pero enfocable para que el teclado también vea el aviso de "próximamente".
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true, tabIndex: 0 };

  const card = (
    <Box
      {...linkProps}
      sx={{
        ...CARD_PATTERN_SX,
        ...ROW_SX,
        border: muted ? '1px dashed' : '1px solid',
        borderColor: 'neutral.border',
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        transition: 'border-color .15s ease',
        ...(to && {
          '&:hover': { borderColor: 'secondary.main' },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 2 },
        }),
      }}
    >
      {Icon && (
        <Box sx={muted ? { ...ICON_BOX_SX, bgcolor: 'neutral.surface', color: 'text.secondary' } : ICON_BOX_SX}>
          <Icon />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="h3" sx={{ fontWeight: 700, fontSize: { xs: fontPx(18), md: fontPx(20) }, color: 'primary.main' }}>
          {title}
        </Typography>
        {description && <Typography sx={DESCRIPTION_SX}>{description}</Typography>}
        {!to && (
          <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: 'text.secondary', mt: 1 }}>Próximamente</Typography>
        )}
      </Box>
    </Box>
  );

  return to ? (
    card
  ) : (
    <Tooltip title={COMING_SOON_MESSAGE} placement="top" arrow>
      {card}
    </Tooltip>
  );
}
