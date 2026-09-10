import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#193D31',
      dark: '#112b22',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6300',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3ECE7',
      paper: '#ffffff',
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
