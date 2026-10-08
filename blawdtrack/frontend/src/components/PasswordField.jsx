import { useState } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

/**
 * Campo de contraseña con botón para mostrarla u ocultarla (el usuario controla qué ve y puede revisar
 * lo que escribió antes de enviar). Acepta las mismas props que `TextField`.
 * @param {{ visibilityLabel?: string }} props `visibilityLabel` completa el nombre accesible del botón
 *   ("Mostrar contraseña", "Mostrar nueva contraseña"…) cuando hay más de un campo en el formulario.
 */
export default function PasswordField({ visibilityLabel = 'contraseña', slotProps, ...textFieldProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...textFieldProps}
      type={visible ? 'text' : 'password'}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={() => setVisible((current) => !current)}
                aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${visibilityLabel}`}
              >
                {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
