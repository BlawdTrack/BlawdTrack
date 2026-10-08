import { IconButton, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { FONT } from '../theme';

/**
 * Icono ⓘ que guarda una leyenda: el texto aparece al pasar el cursor, al enfocarlo con el teclado o al tocarlo
 * en el celular, y el resto del tiempo no ocupa espacio. Es el lugar de las explicaciones que no hace falta
 * leer cada vez.
 * @param {{ label: string, children: import('react').ReactNode, sx?: object }} props `label` es el nombre
 *   accesible del icono (por ejemplo, "¿Cuándo se puede desactivar a un mensajero?") y `children` la leyenda.
 */
export default function HelpTip({ label, children, sx }) {
  return (
    <Tooltip
      arrow
      enterTouchDelay={0}
      leaveTouchDelay={8000}
      title={children}
      slotProps={{ tooltip: { sx: { fontSize: FONT.sm, lineHeight: 1.5, maxWidth: 340, p: 1.5 } } }}
    >
      <IconButton aria-label={label} sx={{ width: 44, height: 44, my: '0px', color: 'text.secondary', ...sx }}>
        <InfoOutlinedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}
