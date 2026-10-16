import { useId } from 'react';
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
//                oscuro (`onDark`), donde el crema se vuelve transparente.
//  - isologo:    solo la B, recortada de Logo_T.png.
// `minWidth` es el ancho mínimo del logo (sin contar el resguardo) en px: nunca se dibuja más pequeño.
// `exact` recorta solo el logo y deja el resguardo como relleno transparente, porque en Logo_T el texto queda
// demasiado cerca de la B para tomar el resguardo de la imagen.
const VARIANTS = {
  stacked: { src: logoStacked, canvas: 500, box: { x: 56, y: 99, w: 378, h: 245 }, minWidth: 95, exact: false },
  horizontal: { src: logoHorizontal, canvas: 1024, box: { x: 129, y: 400, w: 765, h: 204 }, minWidth: 45, exact: false, jpg: true },
  isologo: { src: logoStacked, canvas: 500, box: { x: 172, y: 99, w: 145, h: 173 }, minWidth: 30, exact: true },
  //  - horizontalShort: como horizontal, pero sin la "B" del texto: la B del logo hace de primera letra y se lee
  //                     "B" + "lawdTrack". `cut` es la franja (en px del archivo) que se quita, la "B" del texto.
  horizontalShort: {
    src: logoHorizontal,
    canvas: 1024,
    box: { x: 129, y: 400, w: 765, h: 204 },
    minWidth: 45,
    exact: false,
    jpg: true,
    cut: { x: 316, w: 70 },
  },
};

// Colores de marca para la versión sobre fondo oscuro, como valores 0–1 de una matriz de color:
// crema #FAF8F5 para la B y el texto, naranja #FF6C0E para la ruta y el pin.
const CREAM = [0.98, 0.973, 0.961];
const ORANGE = [1, 0.4235, 0.0549];

/**
 * Filtros SVG de la versión sobre fondo oscuro. El texto verde del logo no se lee sobre el verde, así que se
 * redibuja con los colores de la marca: toda la tinta en crema (`ink`) y encima solo las zonas naranjas en el
 * naranja de marca (`orange`). En el PNG la tinta sale del canal alfa; en el JPG, de la luminosidad (el fondo
 * crema queda transparente). El naranja se detecta porque su rojo supera mucho a su verde.
 */
function OnDarkFilters({ id }) {
  const solid = (c) => `0 0 0 0 ${c[0]}  0 0 0 0 ${c[1]}  0 0 0 0 ${c[2]}`;
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <filter id={`${id}-ink-png`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${solid(CREAM)}  0 0 0 1 0`} />
        </filter>
        <filter id={`${id}-ink-jpg`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${solid(CREAM)}  -0.6378 -2.1456 -0.2166 0 2.5`} />
        </filter>
        <filter id={`${id}-orange`} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${solid(ORANGE)}  4 -4 0 0 -0.8`} result="mask" />
          <feComposite in="mask" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Logotipo oficial de BlawdTrack. Recorta el archivo a la zona del logo y le deja alrededor el área de resguardo
 * (25 % del alto). No aplica sombras, rotación ni estiramiento ni pone el logo dentro de una caja.
 * Sobre fondos claros usa `stacked` o `isologo`; sobre fondos verdes u oscuros, con `onDark`, cualquiera de las
 * tres variantes (la horizontal solo existe en una versión para fondo oscuro), siempre en los colores de marca.
 * @param {{ variant?: 'stacked'|'horizontal'|'isologo', width?: number, onDark?: boolean, sx?: object }} props
 *   `width` es el ancho del logo en px, sin contar el resguardo; no baja del mínimo de la variante.
 */
export default function BrandLogo({ variant = 'stacked', width, onDark = false, sx }) {
  const filterId = `logo${useId().replace(/[^A-Za-z0-9]/g, '')}`;
  const { src, canvas, box, minWidth, exact, jpg, cut } = VARIANTS[variant];
  const cutW = cut?.w ?? 0;
  const pad = box.h * CLEAR_SPACE;
  const total = { w: box.w - cutW + pad * 2, h: box.h + pad * 2 };
  const factor = total.w / (box.w - cutW);
  const logoWidth = Math.max(width ?? minWidth, minWidth);
  // Zona del archivo que se muestra: solo el logo (con `exact`) o el logo más su resguardo. Si hay `cut`, ese
  // tramo se quita y lo que queda a su derecha se recorre a la izquierda; `w` ya no lo incluye.
  const crop = exact ? box : { x: box.x - pad, y: box.y - pad, w: total.w, h: total.h };

  const imageStyle = (shift = 0) => ({
    position: 'absolute',
    display: 'block',
    width: `${(canvas / crop.w) * 100}%`,
    height: 'auto',
    left: `${(-(crop.x + shift) / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
    maxWidth: 'none',
  });
  // Con `cut`, la imagen se dibuja en dos mitades: la izquierda hasta la franja y la derecha desde su final.
  const cutAt = cut ? ((cut.x - crop.x) / crop.w) * 100 : 100;
  const pieces = cut
    ? [
        { style: imageStyle(), clip: `inset(0 ${100 - cutAt}% 0 0)` },
        { style: imageStyle(cutW), clip: `inset(0 0 0 ${cutAt}%)` },
      ]
    : [{ style: imageStyle() }];

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
      {onDark && <OnDarkFilters id={filterId} />}
      <Box sx={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: `${crop.w} / ${crop.h}` }}>
        {pieces.map(({ style, clip }, i) => (
          <Box key={i} sx={{ position: 'absolute', inset: 0, clipPath: clip }}>
            <img
              src={src}
              alt={i === 0 ? 'BlawdTrack' : ''}
              aria-hidden={i === 0 ? undefined : 'true'}
              draggable={false}
              style={{ ...style, ...(onDark && { filter: `url(#${filterId}-ink-${jpg ? 'jpg' : 'png'})` }) }}
            />
            {onDark && (
              <img src={src} alt="" aria-hidden="true" draggable={false} style={{ ...style, filter: `url(#${filterId}-orange)` }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
