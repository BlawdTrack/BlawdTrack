import { createTheme } from '@mui/material/styles';
// Paleta y tipografía alineadas al mockup de diseño (Inter + Poppins, verde/naranja BlawdTrack).
/** Tema de MUI de la aplicación (paleta verde/naranja de BlawdTrack; fuentes Inter y Poppins). */
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1A3C34',      // Verde Oscuro (Encabezados, botones primarios)
      dark: '#12322B',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6C0E',    // Anaranjado (Acciones de acento, alertas, foco)
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAF8F5',  // Tono crema/gris claro de fondo de pantalla
      paper: '#ffffff',    // Tarjetas y formularios en blanco limpio
    },
    text: {
      primary: '#1F2421',
      secondary: '#6B6560',
    },
  },
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
          borderRadius: '10px',
          minHeight: 44,
          padding: '8px 20px',
        },
        sizeLarge: {
          minHeight: 48,
          fontSize: '1rem',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: '10px' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
  },
});