import { createTheme } from '@mui/material/styles';

// Paleta y tipografía tomadas del mockup oficial (Claude Design,
// BlawdTrack_Sprint_1). Los grises/estados (success/warning/error) son
// nuevos respecto al theme.js original de la rama HU003 — antes ese
// archivo no los definía y MUI usaba sus tonos por defecto, que no
// coincidían con el mockup.
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1A3C34',
      dark: '#112b22',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6C0E',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2F7D4F',
      light: '#E5F1E8',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#C9860F',
      light: '#FCF3E3',
      contrastText: '#ffffff',
    },
    error: {
      main: '#C0392B',
      light: '#FCEDEA',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAF8F5',
      paper: '#ffffff',
    },
    text: {
      primary: '#1F2421',
      secondary: '#6B6560',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 700 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          backgroundColor: '#ffffff',
        },
        notchedOutline: {
          borderColor: '#DCD4CA',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          paddingTop: '14px',
          paddingBottom: '14px',
        },
      },
    },
  },
});
