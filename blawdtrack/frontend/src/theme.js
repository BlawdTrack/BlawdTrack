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

// Patrón de fondo: el PNG (gris frío) no se usa como imagen, sino como MÁSCARA de una capa de verde de marca a muy
// baja opacidad. Así el dibujo conserva su forma pero se ve como una textura cálida que no compite con el
// contenido, y el archivo original no se modifica. Opacidades elegidas: 10 % en el fondo de pantalla y 6 % dentro
// de las tarjetas, donde hay texto y campos.
const PATTERN_TINT = '#1A3C34';
const PAGE_PATTERN_OPACITY = 0.1;
const CARD_PATTERN_OPACITY = 0.06;

const patternLayer = (opacity, size) => ({
  content: '""',
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  backgroundColor: PATTERN_TINT,
  opacity,
  WebkitMaskImage: `url(${patternUrl})`,
  maskImage: `url(${patternUrl})`,
  WebkitMaskSize: `${size}px`,
  maskSize: `${size}px`,
  WebkitMaskRepeat: 'repeat',
  maskRepeat: 'repeat',
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
 * Superficie blanca (tarjetas, formularios, diálogos y barras) con el patrón teñido muy suave. No se usa en
 * botones. Define `position: relative`: quien la use con otra posición (fija, pegajosa) debe poner este objeto
 * antes de su propio `position`.
 */
export const CARD_PATTERN_SX = {
  backgroundColor: WHITE,
  position: 'relative',
  isolation: 'isolate',
  '&::before': patternLayer(CARD_PATTERN_OPACITY, 420),
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
  shadows: SHADOWS,
  // Escala tipográfica única de la aplicación: 12 (etiquetas y ayudas) · 14 (texto secundario) ·
  // 16 (texto base) · 18 (títulos de sección) · 24 (título de pantalla) · 32 (portadas).
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: '2rem', lineHeight: 1.25 },
    h5: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h6: { fontFamily: '"Poppins", "Inter", sans-serif', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.35 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.4 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: PAGE_PATTERN_SX },
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
          minHeight: 44,
          padding: '8px 20px',
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
          minHeight: 48,
          fontSize: '1rem',
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
      styleOverrides: { root: { borderRadius: RADIUS.sm, minWidth: 44, minHeight: 44 } },
    },
    MuiLink: {
      styleOverrides: {
        root: { '&:focus-visible': { outline: FOCUS_OUTLINE, outlineOffset: 2, borderRadius: RADIUS.sm } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: RADIUS.lg, fontWeight: 700, fontSize: '0.75rem' } },
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
          fontSize: '0.75rem',
          fontWeight: 500,
          borderRadius: RADIUS.sm,
          padding: '6px 10px',
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
          '& .MuiOutlinedInput-root': { borderRadius: RADIUS.sm },
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
