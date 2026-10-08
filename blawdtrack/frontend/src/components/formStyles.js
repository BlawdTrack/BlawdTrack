// Estilos compartidos de los formularios de gestión, para que todos los campos (incluidas las ruedas de
// hora y de peso) midan y se vean igual.
import { CARD_PATTERN_SX } from '../theme';

/** Etiqueta de un campo: pequeña, en mayúsculas y siempre visible sobre el campo. */
export const LABEL_SX = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.5px',
  color: '#6B6560',
  mb: 0.75,
  display: 'block',
  textTransform: 'uppercase',
};

/** Etiqueta sin margen inferior, para campos cuyo contenedor ya los separa con `gap`. */
export const INLINE_LABEL_SX = { ...LABEL_SX, mb: 0 };

/** Campo de texto: 16 px y unos 52 px de alto (cómodo de tocar y de leer). */
export const INPUT_SX = {
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 16, '& fieldset': { borderColor: '#DCD4CA' } },
  '& .MuiOutlinedInput-input': { py: 1.6 },
};

/** Tarjeta blanca de las pantallas de gestión (listas, formularios, historiales). */
export const CARD_SX = {
  borderRadius: '18px',
  border: '1px solid #E4DED7',
  ...CARD_PATTERN_SX,
  boxShadow: '0 12px 30px rgba(26,60,52,.06)',
};

/** Hace que un campo ocupe toda la fila del formulario de dos columnas (en móvil ya es una sola). */
export const FULL_ROW_SX = { gridColumn: { md: 'span 2' } };
