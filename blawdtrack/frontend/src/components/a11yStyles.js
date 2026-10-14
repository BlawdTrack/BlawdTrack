/**
 * Oculta un elemento a la vista pero lo deja disponible para los lectores de pantalla. Las medidas van en píxeles:
 * en `sx`, `width: 1` significa el 100 % del contenedor y el elemento acababa ensanchando la página.
 */
export const VISUALLY_HIDDEN_SX = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  m: '-1px',
  p: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};
