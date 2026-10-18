import { Box, TextField, Typography } from '@mui/material';
import { INPUT_SX, LABEL_SX } from './formStyles';

/**
 * Campo "Nueva contraseña (opcional)" de los formularios de edición de cuentas: vacío no cambia nada.
 * @param {{ id: string, value: string, onChange: Function, error?: string, hint: string }} props `hint` es el texto
 *   de ayuda cuando no hay error.
 */
export default function OptionalPasswordField({ id, value, onChange, error, hint }) {
  return (
    <Box>
      <Typography component="label" htmlFor={id} sx={LABEL_SX}>Nueva contraseña (opcional)</Typography>
      <TextField
        fullWidth
        id={id}
        type="password"
        name="password"
        autoComplete="new-password"
        value={value}
        onChange={onChange}
        error={Boolean(error)}
        helperText={error || hint}
        placeholder="••••••••"
        sx={INPUT_SX}
      />
    </Box>
  );
}
