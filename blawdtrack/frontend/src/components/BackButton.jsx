import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Botón "Volver" de los paneles (con borde y flecha): regresa a lo anterior dentro de la misma pantalla.
 * @param {{ onClick: Function, children?: import('react').ReactNode, sx?: object }} props `children` es la
 *   etiqueta ("Volver" por defecto); `sx` ajusta el botón (por ejemplo, ocuparlo todo el ancho en móvil).
 */
export default function BackButton({ onClick, children = 'Volver', sx }) {
  return (
    <Button
      onClick={onClick}
      startIcon={<ArrowBackIcon />}
      sx={{ color: 'primary.main', fontWeight: 600, border: '1.5px solid #DCD4CA', ...sx }}
    >
      {children}
    </Button>
  );
}
