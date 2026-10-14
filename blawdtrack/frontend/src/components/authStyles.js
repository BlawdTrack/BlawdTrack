import { FONT, rem } from '../theme';

/** Crema liso del lado del formulario de las pantallas de acceso (cubre el patrón del fondo de la app). */
export const AUTH_CREAM = '#FAF8F5';

/** Anillo de foco visible de 3 px para enlaces y botones. */
export const FOCUS_RING_SX = { '&:focus-visible': { outline: '3px solid #1A3C34', outlineOffset: 2 } };

/** Sin animaciones para quien pide menos movimiento. */
export const REDUCED_MOTION_SX = { '@media (prefers-reduced-motion: reduce)': { transition: 'none' } };

// Etiqueta de los campos: en minúsculas, en negrita y en verde oscuro, como en el diseño.
export const FIELD_LABEL_SX = { fontSize: FONT.lg, fontWeight: 700, color: 'primary.main' };

// Campos altos (56 px), de esquinas redondeadas y con un borde de foco de 3 px.
export const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    minHeight: 56,
    borderRadius: rem(14),
    fontSize: FONT.lg,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 3, borderColor: 'primary.main' },
  },
};

// Botón principal de las pantallas de acceso: alto, redondeado y en negrita.
export const AUTH_BUTTON_SX = { fontWeight: 700, fontSize: FONT.lg, minHeight: 56, borderRadius: rem(16), ...FOCUS_RING_SX };
