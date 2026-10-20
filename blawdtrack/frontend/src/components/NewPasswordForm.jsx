import { Box, Button, CircularProgress, Typography } from '@mui/material';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import AuthStateHeader from './AuthStateHeader';
import PasswordField from './PasswordField';
import { PasswordRequirements } from './PasswordRequirements';
import { StatusMessage } from './StatusMessage';
import { AUTH_BUTTON_SX, FIELD_LABEL_SX, FIELD_SX } from './authStyles';
import { PASSWORD_RESET_MESSAGES } from '../utils/passwordResetErrors';

/**
 * Formulario "Crear nueva contraseña" (HU-002): los dos campos con las reglas en vivo y el botón de guardar. No tiene
 * estado propio: todo viene de `usePasswordResetConfirmation`.
 * @param {{ reset: ReturnType<import('../hooks/usePasswordResetConfirmation').usePasswordResetConfirmation> }} props
 */
export function NewPasswordForm({ reset }) {
  const {
    newPassword, confirmPassword, loading, error, historyRejected, confirmMismatch, canSubmit,
    onNewPasswordChange, onConfirmPasswordChange, onSubmit,
  } = reset;

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <AuthStateHeader
        icon={LockResetOutlinedIcon}
        title="Crear nueva contraseña"
        description="Elige una contraseña segura que no hayas usado antes."
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography component="label" htmlFor="new-password" sx={FIELD_LABEL_SX}>
            Nueva contraseña
          </Typography>
          <PasswordField
            id="new-password"
            visibilityLabel="nueva contraseña"
            fullWidth
            required
            name="newPassword"
            placeholder="••••••••"
            autoComplete="new-password"
            value={newPassword}
            onChange={onNewPasswordChange}
            disabled={loading}
            error={error?.field === 'newPassword'}
            sx={FIELD_SX}
          />
        </Box>

        <PasswordRequirements password={newPassword} historyRejected={historyRejected} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography component="label" htmlFor="confirm-password" sx={FIELD_LABEL_SX}>
          Confirmar contraseña
        </Typography>
        <PasswordField
          id="confirm-password"
          visibilityLabel="confirmación de contraseña"
          fullWidth
          required
          name="confirmPassword"
          placeholder="••••••••"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={loading}
          error={confirmMismatch || error?.field === 'confirmPassword'}
          helperText={confirmMismatch ? PASSWORD_RESET_MESSAGES.mismatch : undefined}
          sx={FIELD_SX}
        />
      </Box>

      {error && <StatusMessage severity="error" message={error.message} />}

      <Button type="submit" fullWidth variant="contained" disabled={loading || !canSubmit} sx={AUTH_BUTTON_SX}>
        {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Guardar nueva contraseña'}
      </Button>
    </Box>
  );
}

export default NewPasswordForm;
