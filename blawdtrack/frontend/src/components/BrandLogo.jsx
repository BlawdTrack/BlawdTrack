import { Box } from '@mui/material';
import { RADIUS, rem } from '../theme';
import logoStacked from '../assets/Logo_T.png';
import logoStackedCream from '../assets/Logo_C.jpg';
import logoHorizontalCream from '../assets/Logo_H.jpg';

/** Crema de fondo de los logos en JPG (`Logo_C` y `Logo_H`). Las baldosas de los logos transparentes lo usan para verse igual. */
export const LOGO_CREAM = '#F6EFDF';

/** Área de resguardo: un cuarto del alto del logo, libre por todos los lados. */
export const CLEAR_SPACE = 0.25;

// Cada variante apunta a un archivo oficial y a la zona exacta (en px del archivo) que ocupa el logo dentro de su
// lienzo; el componente recorta justo esa zona más el área de resguardo, sin estirar la imagen.
//  - stacked:        Logo_T.png, a todo color y con fondo transparente (para superficies claras).
//  - stackedCream:   Logo_C.jpg, logo completo sobre su fondo crema (sirve sobre superficies oscuras).
//  - horizontalCream: Logo_H.jpg, B y texto en una línea sobre su fondo crema.
//  - isologo:        solo la B, recortada de Logo_T.png; va sobre una baldosa crema.
// `minWidth` es el ancho mínimo del logo (sin contar el resguardo) en px: nunca se dibuja más pequeño.
const VARIANTS = {
  stacked: { src: logoStacked, canvas: 500, box: { x: 56, y: 99, w: 378, h: 245 }, minWidth: 95, tile: false },
  stackedCream: { src: logoStackedCream, canvas: 1024, box: { x: 115, y: 203, w: 773, h: 502 }, minWidth: 95, tile: false },
  horizontalCream: { src: logoHorizontalCream, canvas: 1024, box: { x: 129, y: 400, w: 765, h: 204 }, minWidth: 45, tile: false },
  isologo: { src: logoStacked, canvas: 500, box: { x: 172, y: 99, w: 145, h: 173 }, minWidth: 30, tile: true },
};

/**
 * Logotipo oficial de BlawdTrack. Recorta el archivo a la zona del logo y le deja alrededor el área de resguardo
 * (25 % del alto). No aplica sombras, rotación ni estiramiento. Los logos de texto verde no deben ir sobre fondos
 * verdes: para eso están `stackedCream` y `horizontalCream` (con su propio fondo crema) y `isologo` (con baldosa).
 * En las variantes con baldosa el resguardo es relleno crema de la baldosa, porque en el archivo el texto queda
 * demasiado cerca de la B para tomarlo de la imagen.
 * @param {{ variant?: 'stacked'|'stackedCream'|'horizontalCream'|'isologo', width?: number, sx?: object }} props
 *   `width` es el ancho del logo en px, sin contar el resguardo; no baja del mínimo de la variante.
 */
export default function BrandLogo({ variant = 'stacked', width, sx }) {
  const { src, canvas, box, minWidth, tile } = VARIANTS[variant];
  const pad = box.h * CLEAR_SPACE;
  const total = { w: box.w + pad * 2, h: box.h + pad * 2 };
  const factor = total.w / box.w;
  const logoWidth = Math.max(width ?? minWidth, minWidth);
  // Zona del archivo que se muestra: con baldosa, solo el logo; sin baldosa, el logo más su resguardo.
  const crop = tile
    ? box
    : { x: box.x - pad, y: box.y - pad, w: total.w, h: total.h };

  return (
    <Box
      sx={{
        flex: '0 0 auto',
        boxSizing: 'border-box',
        // El ancho nunca baja del mínimo del logo (más su resguardo), aunque la raíz tipográfica se reduzca.
        width: `max(${minWidth * factor}px, ${rem(logoWidth * factor)})`,
        // El relleno en % se mide sobre el ancho: deja el resguardo igual en los cuatro lados.
        p: tile ? `${(pad / total.w) * 100}%` : 0,
        borderRadius: RADIUS.sm,
        bgcolor: tile ? LOGO_CREAM : 'transparent',
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
          }}
        />
      </Box>
    </Box>
  );
}
