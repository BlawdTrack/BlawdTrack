import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import AuthStateHeader from './AuthStateHeader';
import { AUTH_BUTTON_SX, FIELD_LABEL_SX, FIELD_SX } from './authStyles';

/**
 * Formulario de "Recuperar contraseña" (HU-002): pide el correo de la cuenta. No tiene estado propio: todo viene de
 * `usePasswordRecoveryRequest`.
 * @param {{ request: ReturnType<import('../hooks/usePasswordRecoveryRequest').usePasswordRecoveryRequest> }} props
 */
export function RecoveryRequestForm({ request }) {
  const { email, emailError, loading, onEmailChange, onSubmit } = request;

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <AuthStateHeader
        icon={VpnKeyOutlinedIcon}
        title="Recuperar contraseña"
        description="Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una nueva."
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography component="label" htmlFor="recovery-email" sx={FIELD_LABEL_SX}>
          Correo electrónico registrado
        </Typography>
        <TextField
          id="recovery-email"
          fullWidth
          required
          name="email"
          type="email"
          placeholder="nombre@blawdgourmet.com"
          autoComplete="email"
          value={email}
          onChange={onEmailChange}
          disabled={loading}
          error={Boolean(emailError)}
          helperText={emailError}
          sx={FIELD_SX}
        />
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        endIcon={loading ? null : <ArrowForwardOutlinedIcon />}
        sx={AUTH_BUTTON_SX}
      >
        {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Enviar enlace'}
      </Button>
    </Box>
  );
}

export default RecoveryRequestForm;
