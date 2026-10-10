import { Box, TextField, Typography } from '@mui/material';
import { INPUT_SX, LABEL_SX } from './formStyles';

/**
 * Etiqueta siempre visible sobre un control, con el texto de error debajo. Sirve de marco para los
 * controles que no son un campo de texto (selectores de rueda de hora y de peso).
 * @param {{ name: string, label: string, errorText?: string, sx?: object, children: import('react').ReactNode }} props
 *   `name` es el `id` del control al que apunta la etiqueta.
 */
export function FieldShell({ name, label, errorText, sx, children }) {
  return (
    <Box sx={sx}>
      <Typography variant="caption" component="label" htmlFor={name} sx={LABEL_SX}>
        {label}
      </Typography>
      {children}
      {errorText && (
        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mx: 1.75 }}>
          {errorText}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Campo de formulario: etiqueta visible y control de ancho completo. Acepta las props de `TextField`
 * (incluido `select`) o las de otro control pasado en `as`, como `PasswordField`.
 * @param {{ name: string, label: string, sx?: object, as?: import('react').ElementType }} props `sx` ajusta
 *   el contenedor (por ejemplo, ocupar toda la fila).
 */
export default function FormField({ name, label, sx, as: Input = TextField, ...inputProps }) {
  return (
    <FieldShell name={inputProps.id ?? name} label={label} sx={sx}>
      <Input name={name} fullWidth sx={INPUT_SX} {...inputProps} />
    </FieldShell>
  );
}
