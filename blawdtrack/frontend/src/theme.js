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
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Poppins", "Inter", sans-serif',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          paddingTop: '12px',
          paddingBottom: '12px',
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