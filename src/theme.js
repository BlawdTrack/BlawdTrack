import { createTheme } from '@mui/material/styles';
// aqui se hara la parte de los colores correspondientes al sistema y sus secciones
export const theme = createTheme({
  palette: {
    primary: {
      main: '#193D31',      // Verde Oscuro (Encabezados, botones primarios)
      dark: '#112b22',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6300',    // Anaranjado (Acciones de acento, alertas, foco)
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3ECE7',  // Tono crema/gris claro de fondo de pantalla
      paper: '#ffffff',    // Tarjetas y formularios en blanco limpio
    },
    text: {
      primary: '#193D31',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          paddingTop: '12px',
          paddingBottom: '12px',
        },
      },
    },
  },
});