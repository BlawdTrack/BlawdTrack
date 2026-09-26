import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { confirmPasswordReset } from '../services/PasswordRecoveryService';
import { StatusMessage } from '../components/StatusMessage';
import { RecoverySteps } from '../components/RecoverySteps';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { meetsClientPasswordRules } from '../utils/passwordRules';

// Textos propios del frontend (no se muestra el `message` crudo del backend,
// que viene en otro idioma). Los tres primeros son los del mockup (`savePwd`).
const RULES_ERROR_MESSAGE = 'La contraseña no cumple todos los requisitos de la lista.';
const MISMATCH_ERROR_MESSAGE = 'Las contraseñas no coinciden.';
const REUSED_ERROR_MESSAGE =
  'No puedes reutilizar ninguna de tus últimas 3 contraseñas. Elige una diferente.';
const VALIDATION_ERROR_MESSAGE =
  'La contraseña no cumple los requisitos. Usa al menos 8 caracteres, con letras y números.';
const CONNECTION_ERROR_MESSAGE =
  'No pudimos conectar con el servidor. Revisa tu conexión a internet e intenta de nuevo.';
const GENERIC_ERROR_MESSAGE = 'No se pudo actualizar la contraseña. Intenta de nuevo en unos minutos.';
const MISSING_TOKEN_MESSAGE =
  'Este enlace está incompleto. Solicita uno nuevo para restablecer tu contraseña.';
const REJECTED_TOKEN_MESSAGE =
  'Este enlace no es válido o ya expiró. Solicita uno nuevo para restablecer tu contraseña.';

const TITLE_SX = {
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 600,
  fontSize: 18,
  color: 'primary.main',
};

const LABEL_SX = {
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: '#6B6560',
};

const INPUT_SX = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#fff', fontSize: 15 },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DCD4CA', borderWidth: '1.5px' },
};

const BUTTON_SX = { borderRadius: '10px', py: '15px', fontWeight: 600, fontSize: 15 };

// T05 de HU-002 (#66): el usuario llega desde el enlace del correo y define
// su nueva contraseña. Vistas del mismo flujo (r3/r4 del mockup + el caso sin
// token válido): formulario, éxito y "enlace no válido".
//
// SUPUESTOS PENDIENTES DE CONFIRMAR con el equipo de backend:
//  - El enlace del correo apunta a esta pantalla como `/recovery?token=<token>`
//    (valor por defecto de MAIL_LINK_URL en el backend; ver EmailService).
//  - El contrato de POST /v1/auth/password-reset/confirm está en
//    PasswordRecoveryService.confirmPasswordReset.
export function NewPasswordPage({ onGoToLogin, onRequestNewLink }) {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') ?? '').trim();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // { message, field? }
  const [historyRejected, setHistoryRejected] = useState(false);
  const [tokenRejected, setTokenRejected] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const clearFeedback = () => {
    if (error) setError(null);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
    clearFeedback();
    // La regla 4 solo se marcó como no cumplida para la contraseña rechazada;
    // con otra contraseña vuelve a "pendiente".
    setHistoryRejected(false);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
    clearFeedback();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!meetsClientPasswordRules(newPassword)) {
      setError({ message: RULES_ERROR_MESSAGE, field: 'newPassword' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setError({ message: MISMATCH_ERROR_MESSAGE, field: 'confirmPassword' });
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await confirmPasswordReset(token, newPassword);
      // La contraseña ya no se necesita en memoria.
      setNewPassword('');
      setConfirmPassword('');
      setSucceeded(true);
    } catch (err) {
      const code = err.response?.data?.code;
      if (!err.response) {
        setError({ message: CONNECTION_ERROR_MESSAGE });
      } else if (code === 'TOKEN_INVALIDO') {
        setTokenRejected(true);
      } else if (code === 'CONTRASENA_REUTILIZADA') {
        // Esto sí lo confirmó el backend: la regla 4 pasa a "no cumplida".
        setHistoryRejected(true);
        setError({ message: REUSED_ERROR_MESSAGE, field: 'newPassword' });
      } else if (code === 'VALIDATION_ERROR') {
        setError({ message: VALIDATION_ERROR_MESSAGE, field: 'newPassword' });
      } else {
        setError({ message: GENERIC_ERROR_MESSAGE });
      }
    } finally {
      setLoading(false);
    }
  };

  let content;
  if (succeeded) {
    content = (
      <Box
        role="status"
        sx={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}
      >
        <Box
          aria-hidden
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: '#E9F3EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 20,
              height: 10,
              borderLeft: '3px solid #2F7D4F',
              borderBottom: '3px solid #2F7D4F',
              transform: 'rotate(-45deg) translateY(-2px)',
            }}
          />
        </Box>
        <Typography component="h1" sx={TITLE_SX}>
          Contraseña actualizada
        </Typography>
        {/* No se afirma que se cerraron las sesiones de otros dispositivos
            (frase del mockup): el backend no lo hace al confirmar el cambio. */}
        <Typography sx={{ fontSize: 13.5, color: '#6B6560', lineHeight: 1.55 }}>
          Ya puedes iniciar sesión con tu nueva contraseña.
        </Typography>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onGoToLogin?.()}
          sx={BUTTON_SX}
        >
          Ir a iniciar sesión
        </Button>
      </Box>
    );
  } else if (!token || tokenRejected) {
    content = (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Typography component="h1" sx={TITLE_SX}>
          Enlace no válido
        </Typography>
        <Box role="alert">
          <StatusMessage
            severity="error"
            message={tokenRejected ? REJECTED_TOKEN_MESSAGE : MISSING_TOKEN_MESSAGE}
          />
        </Box>
        <Button
          fullWidth
          variant="contained"
          onClick={() => onRequestNewLink?.()}
          sx={BUTTON_SX}
        >
          Solicitar un enlace nuevo
        </Button>
      </Box>
    );
  } else {
    content = (
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <Typography component="h1" sx={TITLE_SX}>
          Crear nueva contraseña
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Typography component="label" htmlFor="new-password" sx={LABEL_SX}>
            Nueva contraseña
          </Typography>
          <TextField
            id="new-password"
            fullWidth
            required
            name="newPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            disabled={loading}
            error={error?.field === 'newPassword'}
            sx={INPUT_SX}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Typography component="label" htmlFor="confirm-password" sx={LABEL_SX}>
            Confirmar contraseña
          </Typography>
          <TextField
            id="confirm-password"
            fullWidth
            required
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            disabled={loading}
            error={error?.field === 'confirmPassword'}
            sx={INPUT_SX}
          />
        </Box>

        <PasswordRequirements password={newPassword} historyRejected={historyRejected} />

        {error && (
          <Box role="alert">
            <StatusMessage severity="error" message={error.message} />
          </Box>
        )}

        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={BUTTON_SX}>
          {loading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar nueva contraseña'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Container maxWidth={false}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '18px',
            overflow: 'hidden',
            border: '1px solid #E4DED7',
            boxShadow: '0 16px 38px rgba(26,60,52,.07)',
          }}
        >
          <Box sx={{ height: 4, bgcolor: 'secondary.main' }} />

          <RecoverySteps current={3} />

          <Box sx={{ p: { xs: '24px 16px', sm: '32px' }, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 460 }}>{content}</Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default NewPasswordPage;
