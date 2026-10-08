import { createTheme } from '@mui/material/styles';
import patternUrl from './assets/background_T.png';

const WHITE = '#ffffff';
// Foco visible de teclado: verde de marca (12:1 sobre blanco). La barra lateral, que es oscura, define el suyo en naranja.
const FOCUS_OUTLINE = '2px solid #1A3C34';
// TODO(marca): confirmar el crema oficial. Se conserva el valor que ya tenía el theme.
const CREAM = '#FAF8F5';

/**
 * Radios de la aplicación, tres y no más: `sm` para botones, campos y chips cuadrados; `md` para tarjetas y
 * paneles; `lg` para las tarjetas de menú, los diálogos y las etiquetas en forma de píldora. Los círculos
 * (`50%`) y las barras finas de 2–4 px no cuentan como radio de esquina.
 */
export const RADIUS = { sm: '10px', md: '16px', lg: '20px' };

/**
 * Escala de la aplicación, fluida. La raíz tipográfica (el `font-size` del `html`) se calcula con el tamaño de la
 * ventana: es 13 px en una ventana de unos 1920 × 950 px y baja en proporción cuando la ventana es más chica o el
 * zoom del navegador es mayor (con el zoom al 100 % en una pantalla chica la ventana mide menos píxeles CSS), con
 * un piso de 9 px y un techo de 14 px. Todo lo que está en rem (espaciado, anchos, alturas, tipografía) la sigue,
 * así el contenido se adapta y cabe sin hacer scroll.
 *
 * `rem(px)` convierte un tamaño pensado para la raíz de 13 px (`ROOT_FONT_PX`) a rem. Mínimos que no bajan, aunque
 * la raíz sea chica: texto de 12 px (`fontPx` y `FONT`) y áreas táctiles de 44 px (`TOUCH_TARGET`).
 */
export const ROOT_FONT_PX = 13;
export const ROOT_FONT_FLUID = 'clamp(9px, min(0.677vw, 1.368vh), 14px)';
export const rem = (px) => `${Number((px / ROOT_FONT_PX).toFixed(4))}rem`;

/** Tamaño de texto fluido pero nunca menor a 12 px. */
export const fontPx = (px) => `max(12px, ${rem(px)})`;

/** Escala tipográfica: etiquetas, texto secundario, texto base, subtítulos, títulos de sección y de pantalla, portada. */
export const FONT = {
  xs: fontPx(12),
  sm: fontPx(12.5),
  md: fontPx(13),
  lg: fontPx(14.5),
  xl: fontPx(16.5),
  h3: fontPx(19),
  h2: fontPx(26),
  h1: fontPx(29),
  hero: fontPx(45),
};

/** Alto mínimo de campos y botones: área táctil (ley de Fitts). No se reduce con la escala. */
export const TOUCH_TARGET = 44;

// Sombras: una de tarjeta (`1`), una pequeña para piezas diminutas como el pulgar del interruptor (`2`) y una de
// elementos flotantes (`8`: menús, avisos, diálogos). El resto de niveles de Material cae en estas.
const CARD_SHADOW = '0 12px 30px rgba(26,60,52,.06)';
const SMALL_SHADOW = '0 1px 3px rgba(26,60,52,.25)';
const OVERLAY_SHADOW = '0 12px 32px rgba(26,60,52,.16)';
const SHADOWS = [
  'none',
  CARD_SHADOW,
  SMALL_SHADOW,
  ...Array(5).fill(CARD_SHADOW),
  ...Array(17).fill(OVERLAY_SHADOW),
];

// Colores de estado: `main` es el color pleno (puntos, iconos, bordes de énfasis), `light` el fondo suave,
// `border` el contorno del aviso y `text` el texto legible sobre `light`.
const STATUS = {
  error: { main: '#C0392B', dark: '#A5301F', light: '#FCEDEA', border: '#E8B4AC', text: '#7A2318', contrastText: WHITE },
  success: { main: '#2F7D4F', dark: '#256B41', light: '#E9F3EC', border: '#BFE0CC', text: '#1E5236', contrastText: WHITE },
  warning: { main: '#C9860F', dark: '#8A5A00', light: '#FCF3E3', border: '#EBC98A', text: '#7A5A12', contrastText: WHITE },
  info: { main: '#1A3C34', dark: '#12322B', light: '#F1ECE7', border: '#DCD4CA', text: '#1A3C34', contrastText: WHITE },
};

// Patrón de fondo. El PNG es un RGB de fondo blanco opaco (sin canal alfa) con el dibujo en gris frío, así que no
// sirve como máscara. Se tiñe sin tocar el archivo con dos modos de mezcla: el verde de marca en modo `color` sobre
// el PNG (el blanco sigue blanco y el gris pasa a verde claro) y la capa entera en `multiply` sobre el fondo (el
// blanco no altera el crema ni el blanco de la tarjeta; solo el dibujo lo oscurece, ya verdoso). La opacidad
// regula cuánto se ve: 15 % en el fondo de pantalla y 0 % dentro de las tarjetas, que son blanco sólido porque
// llevan texto y campos.
const PATTERN_TINT = '#1A3C34';
const PAGE_PATTERN_OPACITY = 0.15;
const CARD_PATTERN_OPACITY = 0;

const patternLayer = (opacity, size) => ({
  content: '""',
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  backgroundImage: `linear-gradient(${PATTERN_TINT}, ${PATTERN_TINT}), url(${patternUrl})`,
  backgroundBlendMode: 'color, normal',
  backgroundSize: `auto, ${size}px`,
  backgroundRepeat: 'no-repeat, repeat',
  mixBlendMode: 'multiply',
  opacity,
  pointerEvents: 'none',
  // Detrás del contenido pero encima del color de fondo de su contenedor (que crea su propio contexto de apilado).
  zIndex: -1,
});

/** Fondo de pantalla: crema de marca con el patrón ilustrado teñido de verde, fijo detrás de todo. */
export const PAGE_PATTERN_SX = {
  backgroundColor: CREAM,
  '&::before': { ...patternLayer(PAGE_PATTERN_OPACITY, 520), position: 'fixed', borderRadius: 0 },
};

/**
 * Superficie blanca (tarjetas, formularios, diálogos y barras). Con `CARD_PATTERN_OPACITY` mayor que 0 lleva el
 * patrón teñido dentro; con 0 es blanco sólido y no se crea ninguna capa. No se usa en botones. Si hay patrón,
 * define `position: relative`: quien la use con otra posición (fija, pegajosa) debe poner este objeto antes de su
 * propio `position`.
 */
export const CARD_PATTERN_SX = {
  backgroundColor: WHITE,
  ...(CARD_PATTERN_OPACITY > 0 && {
    position: 'relative',
    isolation: 'isolate',
    '&::before': patternLayer(CARD_PATTERN_OPACITY, 420),
  }),
};

// Paleta y tipografía alineadas al mockup de diseño (Inter + Poppins, verde/naranja BlawdTrack).
/** Tema de MUI de la aplicación (paleta verde/naranja de BlawdTrack; fuentes Inter y Poppins). */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1A3C34',      // Verde Oscuro (Encabezados, botones primarios)
      dark: '#12322B',
      contrastText: WHITE,
    },
    secondary: {
      main: '#FF6C0E',      // Anaranjado (Acciones de acento, alertas, foco)
      light: '#FFE8D9',     // Fondo suave de acento (iconos, etiquetas)
      dark: '#C25100',      // Naranja oscuro: texto de acento sobre blanco (4,7:1)
      text: '#B84700',      // Naranja de texto sobre `light` (fondo suave de acento) con contraste AA
      contrastText: WHITE,
    },
    ...STATUS,
    // Neutros cálidos de marca: superficie, contorno suave y contorno de campos.
    neutral: {
      main: '#6B6560',
      surface: '#F1ECE7',
      border: '#E4DED7',
      borderStrong: '#DCD4CA',
    },
    background: {
      default: CREAM,       // Tono crema/gris claro de fondo de pantalla
      paper: WHITE,         // Tarjetas y formularios en blanco limpio
    },
    text: {
      primary: '#1F2421',
      secondary: '#6B6560',
    },
  },
  shape: { borderRadius: 10 },
  // Base de espaciado: 6,4 px con la raíz de 13 px (0,4923 rem), así que todos los `p`, `m` y `gap` numéricos
  // siguen a la raíz fluida.
  spacing: (factor) => `${Number((factor * 0.4923).toFixed(4))}rem`,
  shadows: SHADOWS,
  // Escala tipográfica única de la aplicación: 12 (etiquetas y ayudas) · 14 (texto secundario) ·
  // 16 (texto base) · 18 (títulos de sección) · 24 (título de pantalla) · 32 (portadas).
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: FONT.h2, lineHeight: 1.25 },
    h5: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: FONT.h3, lineHeight: 1.3 },
    h6: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: FONT.lg, lineHeight: 1.35 },
    body1: { fontSize: FONT.md, lineHeight: 1.5 },
    body2: { fontSize: FONT.sm, lineHeight: 1.5 },
    caption: { fontSize: FONT.xs, lineHeight: 1.4 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: FONT.sm,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { html: { fontSize: ROOT_FONT_FLUID }, body: PAGE_PATTERN_SX },
    },
    MuiDialog: {
      styleOverrides: { paper: { ...CARD_PATTERN_SX, borderRadius: RADIUS.lg } },
    },
    // Los placeholders de MUI son demasiado claros (2.7:1); este gris cumple el 4.5:1 del nivel AA.
    MuiInputBase: {
      styleOverrides: {
        input: { '&::placeholder': { color: '#757575', opacity: 1 } },
      },
    },
    // Objetivo táctil mínimo de 44 px (48 px en botones grandes): ley de Fitts.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.sm,
          minHeight: TOUCH_TARGET,
          padding: '6px 16px',
        },
        // Los botones nunca son transparentes: sin relleno, el patrón de fondo se vería a través.
        outlined: {
          backgroundColor: WHITE,
          '&:hover': { backgroundColor: '#F1ECE7' },
        },
        text: {
          backgroundColor: WHITE,
          '&:hover': { backgroundColor: '#F1ECE7' },
        },
        contained: {
          '&.Mui-disabled': { backgroundColor: '#E4DED7', color: '#6B6560' },
        },
        sizeLarge: {
          minHeight: TOUCH_TARGET,
          fontSize: FONT.md,
        },
      },
    },
    // Foco visible en todo lo que se puede pulsar (botones, iconos, enlaces), y objetivo táctil mínimo de 44 px
    // también en los botones de icono.
    MuiButtonBase: {
      styleOverrides: {
        root: { '&.Mui-focusVisible': { outline: FOCUS_OUTLINE, outlineOffset: 2 } },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: RADIUS.sm, minWidth: TOUCH_TARGET, minHeight: TOUCH_TARGET } },
    },
    MuiLink: {
      styleOverrides: {
        root: { '&:focus-visible': { outline: FOCUS_OUTLINE, outlineOffset: 2, borderRadius: RADIUS.sm } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: RADIUS.lg, fontWeight: 700, fontSize: FONT.xs } },
    },
    // Los avisos de MUI usan los mismos tonos que `StatusMessage`: fondo suave, contorno y texto del estado.
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: RADIUS.sm, fontWeight: 500 },
        ...Object.fromEntries(
          Object.entries(STATUS).map(([name, tone]) => [
            `standard${name[0].toUpperCase()}${name.slice(1)}`,
            {
              backgroundColor: tone.light,
              color: tone.text,
              border: `1px solid ${tone.border}`,
              '& .MuiAlert-icon': { color: tone.main },
            },
          ])
        ),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: RADIUS.md,
          border: '1px solid #E4DED7',
          boxShadow: OVERLAY_SHADOW,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1A3C34',
          color: WHITE,
          fontSize: FONT.xs,
          fontWeight: 500,
          borderRadius: RADIUS.sm,
          padding: '5px 8px',
        },
        arrow: { color: '#1A3C34' },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: RADIUS.sm, minHeight: TOUCH_TARGET },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS.md,
        },
      },
    },
  },
});
