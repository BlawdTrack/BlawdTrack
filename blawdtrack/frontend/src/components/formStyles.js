// Estilos compartidos de los formularios de gestión, para que todos los campos (incluidas las ruedas de
// hora y de peso) midan y se vean igual.
import { CARD_PATTERN_SX, RADIUS } from '../theme';

/** Etiqueta de un campo: pequeña, en mayúsculas y siempre visible sobre el campo. */
export const LABEL_SX = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.5px',
  color: 'text.secondary',
  mb: 0.75,
  display: 'block',
  textTransform: 'uppercase',
};

/** Etiqueta sin margen inferior, para campos cuyo contenedor ya los separa con `gap`. */
export const INLINE_LABEL_SX = { ...LABEL_SX, mb: 0 };

/** Campo de texto: 16 px y unos 52 px de alto (cómodo de tocar y de leer). */
export const INPUT_SX = {
  backgroundColor: 'background.paper',
  '& .MuiOutlinedInput-root': { borderRadius: RADIUS.sm, fontSize: 16, '& fieldset': { borderColor: 'neutral.borderStrong' } },
  '& .MuiOutlinedInput-input': { py: 1.6 },
};

/** Tarjeta blanca de las pantallas de gestión (listas, formularios, historiales). */
export const CARD_SX = {
  borderRadius: RADIUS.md,
  border: '1px solid', borderColor: 'neutral.border',
  ...CARD_PATTERN_SX,
  boxShadow: 1,
};

/**
 * Enlace con forma de botón de texto ("¿Olvidaste tu contraseña?", "Usar otro correo"): el texto sigue siendo
 * pequeño, pero el área que se puede pulsar mide al menos 44 px (ley de Fitts).
 */
export const LINK_BUTTON_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 44,
  minHeight: 44,
  px: 1,
  borderRadius: RADIUS.sm,
};

/** Hace que un campo ocupe toda la fila del formulario de dos columnas (en móvil ya es una sola). */
export const FULL_ROW_SX = { gridColumn: { md: 'span 2' } };
