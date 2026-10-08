import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { CARD_PATTERN_SX, RADIUS } from '../theme';

// Tarjeta alta y centrada (menús de módulo): icono en cuadro arriba, texto al centro, flecha abajo.
const CARD_VARIANT_SX = {
  flexDirection: { xs: 'row', md: 'column' },
  justifyContent: { xs: 'flex-start', md: 'center' },
  textAlign: { xs: 'left', md: 'center' },
  gap: { xs: 2, md: 2.5 },
  minHeight: { xs: 96, md: 260 },
  p: { xs: 2.5, md: 4 },
  borderRadius: RADIUS.lg,
};

// Fila ancha (menú principal): icono en cuadro a la izquierda, texto alineado a la izquierda y un círculo con
// la flecha a la derecha. Alto mínimo de 88 px, 24 px de relleno lateral, 20 px de relleno vertical y 20 px
// entre el icono y el texto.
const ROW_VARIANT_SX = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  textAlign: 'left',
  gap: 2.5,
  minHeight: 88,
  px: 3,
  py: 2.5,
  borderRadius: RADIUS.md,
};

// Icono de cada variante. En la fila es un cuadro de 48 px (40 px en móvil) con fondo naranja suave; el icono va
// en naranja oscuro porque el naranja pleno sobre ese fondo no llega al 3:1 que se pide a un icono.
const ICON_BOX_SX = {
  card: {
    flex: { xs: '0 0 48px', md: '0 0 72px' },
    width: { xs: 48, md: 72 },
    height: { xs: 48, md: 72 },
    borderRadius: { xs: RADIUS.sm, md: RADIUS.md },
    bgcolor: 'secondary.light',
    color: 'secondary.main',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: { xs: 24, md: 36 } },
  },
  row: {
    flex: '0 0 auto',
    width: { xs: 40, md: 48 },
    height: { xs: 40, md: 48 },
    borderRadius: RADIUS.sm,
    bgcolor: 'secondary.light',
    color: 'secondary.text',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': { fontSize: { xs: 22, md: 26 } },
  },
};

const TITLE_SX = {
  card: { fontWeight: 600, fontSize: { xs: 16, md: 20 }, color: 'primary.main' },
  row: { fontWeight: 600, fontSize: 18, color: 'primary.main' },
};

const DESCRIPTION_SX = {
  card: { fontSize: { xs: 14, md: 16 }, color: 'text.secondary', mt: 0.5, lineHeight: 1.5 },
  // Máximo dos líneas; si el texto es más largo se corta con puntos suspensivos.
  row: {
    fontSize: 14,
    color: 'text.secondary',
    mt: 0.5,
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
};

// Círculo con la flecha. En la tarjeta pasa a naranja al pasar el cursor; en la fila, a verde con la flecha blanca.
const ARROW_SX = {
  card: {
    flex: '0 0 auto',
    width: 36,
    height: 36,
    borderRadius: '50%',
    bgcolor: 'neutral.surface',
    color: 'primary.main',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mt: { xs: 0, md: 'auto' },
    transition: 'background-color .15s ease, color .15s ease',
  },
  row: {
    flex: '0 0 auto',
    width: 40,
    height: 40,
    borderRadius: '50%',
    bgcolor: 'neutral.surface',
    color: 'primary.main',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color .15s ease, color .15s ease',
  },
};

const HOVER_SX = {
  card: {
    borderColor: 'secondary.main',
    boxShadow: 8,
    transform: 'translateY(-2px)',
    '& .menu-card-arrow': { bgcolor: 'secondary.main', color: 'primary.main' },
  },
  // La fila no cambia de tamaño ni de sitio al pasar el cursor: solo el borde y el círculo.
  row: {
    borderColor: 'secondary.main',
    '& .menu-card-arrow': { bgcolor: 'primary.main', color: 'common.white' },
  },
};

/**
 * Tarjeta de los menús (principal y de cada módulo): icono, título y descripción corta. Toda la tarjeta
 * es el enlace (objetivo grande, ley de Fitts). Con `variant="card"` (por defecto) es una tarjeta alta con
 * el contenido centrado que en móvil se compacta en una fila; con `variant="row"` es una fila ancha con el
 * texto a la izquierda y un círculo con la flecha a la derecha. Sin `to` se muestra deshabilitada con el aviso
 * "Próximamente".
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string,
 *   description?: string, variant?: 'card'|'row' }} props
 */
export default function MenuCard({ to = null, icon: Icon, title, description, variant = 'card' }) {
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true };
  const isRow = variant === 'row';

  return (
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        ...CARD_PATTERN_SX,
        border: '1px solid', borderColor: 'neutral.border',
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        transition: 'border-color .15s ease, box-shadow .15s ease, transform .15s ease',
        ...(isRow ? ROW_VARIANT_SX : CARD_VARIANT_SX),
        ...(to && {
          '&:hover': HOVER_SX[variant],
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 2 },
        }),
      }}
    >
      {Icon && (
        <Box sx={ICON_BOX_SX[variant]}>
          <Icon />
        </Box>
      )}
      <Box sx={{ flex: isRow ? 1 : { xs: 1, md: '0 1 auto' }, minWidth: 0 }}>
        <Typography component="h2" sx={TITLE_SX[variant]}>
          {title}
        </Typography>
        {description && <Typography sx={DESCRIPTION_SX[variant]}>{description}</Typography>}
        {!to && (
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary', mt: 1 }}>Próximamente</Typography>
        )}
      </Box>
      {to && (
        <Box className="menu-card-arrow" sx={ARROW_SX[variant]}>
          <ArrowForwardOutlinedIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}
