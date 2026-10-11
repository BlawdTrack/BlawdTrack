import { Box } from '@mui/material';

// Colores de la fila según el resultado: fondo suave, línea superior y barra lateral. Una fila sin tono conserva
// el espacio de la barra para que todas las filas de una lista queden alineadas.
const TONES = {
  none: { bg: 'transparent', border: 'neutral.border', bar: 'transparent' },
  warning: { bg: 'warning.light', border: 'warning.border', bar: 'warning.main' },
  error: { bg: 'error.light', border: 'error.border', bar: 'error.main' },
};

/**
 * Fila de una lista de resultados: se resalta con el tono de su estado (advertencia o error) y sigue en una fila
 * normal si no tiene tono. Se dibuja como elemento de lista: va dentro de un `ul`. El resaltado no debe ser lo
 * único que dice el estado: el contenido lleva su etiqueta.
 * @param {{ tone?: 'none'|'warning'|'error', children: import('react').ReactNode }} props
 */
export default function StatusRow({ tone = 'none', children }) {
  const { bg, border, bar } = TONES[tone] ?? TONES.none;

  return (
    <Box
      component="li"
      sx={{
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap',
        px: 3,
        py: 1.9,
        bgcolor: bg,
        borderTop: '1px solid',
        borderColor: border,
        borderLeft: '4px solid',
        borderLeftColor: bar,
      }}
    >
      {children}
    </Box>
  );
}
