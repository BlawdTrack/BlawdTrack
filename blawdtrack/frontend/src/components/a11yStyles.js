/** Oculta un elemento a la vista pero lo deja disponible para los lectores de pantalla. */
export const VISUALLY_HIDDEN_SX = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};
