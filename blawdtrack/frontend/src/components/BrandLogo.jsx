import { Box } from '@mui/material';
import { rem } from '../theme';
import logoStacked from '../assets/Logo_T.png';
import logoHorizontal from '../assets/Logo_H.jpg';

/** Área de resguardo: un cuarto del alto del logo, libre por todos los lados. */
export const CLEAR_SPACE = 0.25;

// Cada variante apunta a un archivo oficial y a la zona exacta (en px del archivo) que ocupa el logo dentro de su
// lienzo; el componente recorta justo esa zona sin estirar la imagen.
//  - stacked:    Logo_T.png, a todo color y con fondo transparente (logo apilado: B arriba, texto abajo).
//  - horizontal: Logo_H.jpg, B y texto en una línea. Es un JPG con fondo crema, así que solo se usa sobre fondo
//                oscuro (`onDark`), donde el crema se hace invisible con una mezcla de color.
//  - isologo:    solo la B, recortada de Logo_T.png.
// `minWidth` es el ancho mínimo del logo (sin contar el resguardo) en px: nunca se dibuja más pequeño.
// `exact` recorta solo el logo y deja el resguardo como relleno transparente, porque en Logo_T el texto queda
// demasiado cerca de la B para tomar el resguardo de la imagen.
const VARIANTS = {
  stacked: { src: logoStacked, canvas: 500, box: { x: 56, y: 99, w: 378, h: 245 }, minWidth: 95, exact: false },
  horizontal: { src: logoHorizontal, canvas: 1024, box: { x: 129, y: 400, w: 765, h: 204 }, minWidth: 45, exact: false, jpg: true },
  isologo: { src: logoStacked, canvas: 500, box: { x: 172, y: 99, w: 145, h: 173 }, minWidth: 30, exact: true },
};

// Versión para fondos oscuros: el texto verde del logo pasa a un verde menta claro, la ruta y el pin conservan su
// naranja y no queda ninguna caja. En los PNG transparentes basta invertir la luminosidad; el JPG horizontal,
// además, sube el contraste y se mezcla con `screen` para que su fondo crema se funda con el color de detrás.
const ON_DARK_FILTER = 'invert(1) hue-rotate(180deg) brightness(1.15) saturate(1.3)';
const ON_DARK_FILTER_JPG = 'invert(1) hue-rotate(180deg) contrast(1.8) brightness(1.1) saturate(1.3)';

/**
 * Logotipo oficial de BlawdTrack. Recorta el archivo a la zona del logo y le deja alrededor el área de resguardo
 * (25 % del alto). No aplica sombras, rotación ni estiramiento ni pone el logo dentro de una caja.
 * Sobre fondos claros usa `stacked` o `isologo`; sobre fondos verdes u oscuros, con `onDark`, cualquiera de las
 * tres variantes (la horizontal solo existe en una versión para fondo oscuro).
 * @param {{ variant?: 'stacked'|'horizontal'|'isologo', width?: number, onDark?: boolean, sx?: object }} props
 *   `width` es el ancho del logo en px, sin contar el resguardo; no baja del mínimo de la variante.
 */
export default function BrandLogo({ variant = 'stacked', width, onDark = false, sx }) {
  const { src, canvas, box, minWidth, exact, jpg } = VARIANTS[variant];
  const pad = box.h * CLEAR_SPACE;
  const total = { w: box.w + pad * 2, h: box.h + pad * 2 };
  const factor = total.w / box.w;
  const logoWidth = Math.max(width ?? minWidth, minWidth);
  // Zona del archivo que se muestra: solo el logo (con `exact`) o el logo más su resguardo.
  const crop = exact ? box : { x: box.x - pad, y: box.y - pad, w: total.w, h: total.h };

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        boxSizing: 'border-box',
        // El ancho nunca baja del mínimo del logo (más su resguardo), aunque la raíz tipográfica se reduzca.
        width: `max(${minWidth * factor}px, ${rem(logoWidth * factor)})`,
        // El relleno en % se mide sobre el ancho: deja el resguardo igual en los cuatro lados.
        p: exact ? `${(pad / total.w) * 100}%` : 0,
        ...sx,
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: `${crop.w} / ${crop.h}` }}>
        <img
          src={src}
          alt="BlawdTrack"
          draggable={false}
          style={{
            position: 'absolute',
            display: 'block',
            width: `${(canvas / crop.w) * 100}%`,
            height: 'auto',
            left: `${(-crop.x / crop.w) * 100}%`,
            top: `${(-crop.y / crop.h) * 100}%`,
            maxWidth: 'none',
            ...(onDark && { filter: jpg ? ON_DARK_FILTER_JPG : ON_DARK_FILTER }),
            ...(onDark && jpg && { mixBlendMode: 'screen' }),
          }}
        />
      </Box>
    </Box>
  );
}
