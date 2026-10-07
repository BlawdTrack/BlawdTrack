// Estilos compartidos de los formularios de gestión, para que todos los campos (incluidas las ruedas de
// hora y de peso) midan y se vean igual.

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

/** Campo de texto: 16 px y unos 52 px de alto (cómodo de tocar y de leer). */
export const INPUT_SX = {
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: 16, '& fieldset': { borderColor: '#DCD4CA' } },
  '& .MuiOutlinedInput-input': { py: 1.6 },
};
