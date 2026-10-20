import { Box, Button } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import AuthStateHeader from './AuthStateHeader';
import { StatusMessage } from './StatusMessage';
import { AUTH_BUTTON_SX } from './authStyles';
import { PASSWORD_RESET_MESSAGES } from '../utils/passwordResetErrors';

/**
 * Vista de éxito de "Crear nueva contraseña" (HU-002).
 * @param {{ onGoToLogin?: Function }} props
 */
export function NewPasswordSuccess({ onGoToLogin }) {
  return (
    <Box role="status" data-testid="new-password-success" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AuthStateHeader
        icon={CheckCircleOutlinedIcon}
        tone="success"
        title="¡Contraseña actualizada!"
        description="Ya puedes iniciar sesión con tu nueva contraseña."
      />
      <Button fullWidth variant="contained" onClick={() => onGoToLogin?.()} data-testid="new-password-go-login" sx={AUTH_BUTTON_SX}>
        Ir a iniciar sesión
      </Button>
    </Box>
  );
}

/**
 * Vista de "Enlace no válido": el token falta en la URL o el backend lo rechazó (usado o vencido).
 * @param {{ rejected: boolean, onRequestNewLink?: Function }} props `rejected`: el backend lo rechazó; si no, falta.
 */
export function NewPasswordInvalidLink({ rejected, onRequestNewLink }) {
  return (
    <Box data-testid="new-password-invalid-link" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AuthStateHeader icon={LinkOffOutlinedIcon} tone="error" title="Enlace no válido" />
      {/* StatusMessage ya expone role="alert". */}
      <StatusMessage
        severity="error"
        message={rejected ? PASSWORD_RESET_MESSAGES.rejectedToken : PASSWORD_RESET_MESSAGES.missingToken}
      />
      <Button fullWidth variant="contained" onClick={() => onRequestNewLink?.()} data-testid="new-password-request-link" sx={AUTH_BUTTON_SX}>
        Solicitar un enlace nuevo
      </Button>
    </Box>
  );
}
