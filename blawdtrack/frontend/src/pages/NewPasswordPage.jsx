import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { confirmPasswordReset } from '../services/PasswordRecoveryService';
import { StatusMessage } from '../components/StatusMessage';
import { RecoverySteps } from '../components/RecoverySteps';
import AuthCardLayout from '../components/AuthCardLayout';
import PasswordField from '../components/PasswordField';
import { INLINE_LABEL_SX, INPUT_SX } from '../components/formStyles';
import AuthStateHeader from '../components/AuthStateHeader';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import LinkOffOutlinedIcon from '@mui/icons-material/LinkOffOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
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

const BUTTON_SX = { borderRadius: '10px', minHeight: 52, fontWeight: 600, fontSize: 16 };

// T05 de HU-002 (#66): el usuario llega desde el enlace del correo y define
// su nueva contraseña. Vistas del mismo flujo (r3/r4 del mockup + el caso sin
// token válido): formulario, éxito y "enlace no válido".
//
// SUPUESTOS PENDIENTES DE CONFIRMAR con el equipo de backend:
//  - El enlace del correo apunta a esta pantalla como `/recovery?token=<token>`
//    (valor por defecto de MAIL_LINK_URL en el backend; ver EmailService).
//  - El contrato de POST /v1/auth/password-reset/confirm está en
//    PasswordRecoveryService.confirmPasswordReset.
/**
 * Pantalla "Crear nueva contraseña" (HU-002). Se abre desde el enlace del correo (`/recovery?token=...`),
 * valida la contraseña con `PasswordRequirements` y confirma con `confirmPasswordReset`. Tiene tres
 * vistas: formulario, éxito y "enlace no válido" (token ausente, usado o vencido).
 * @param {{ onGoToLogin: Function, onRequestNewLink: Function }} props
 */
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
        sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <AuthStateHeader
          icon={CheckCircleOutlinedIcon}
          tone="success"
          title="Contraseña actualizada"
          description="Ya puedes iniciar sesión con tu nueva contraseña."
        />
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AuthStateHeader icon={LinkOffOutlinedIcon} tone="error" title="Enlace no válido" />
        {/* StatusMessage ya expone role="alert". */}
        <StatusMessage
          severity="error"
          message={tokenRejected ? REJECTED_TOKEN_MESSAGE : MISSING_TOKEN_MESSAGE}
        />
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
        sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <AuthStateHeader
          icon={LockResetOutlinedIcon}
          title="Crear nueva contraseña"
          description="Elige una contraseña segura que no hayas usado antes."
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Typography component="label" htmlFor="new-password" sx={INLINE_LABEL_SX}>
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
            onChange={handleNewPasswordChange}
            disabled={loading}
            error={error?.field === 'newPassword'}
            sx={INPUT_SX}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Typography component="label" htmlFor="confirm-password" sx={INLINE_LABEL_SX}>
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
            onChange={handleConfirmPasswordChange}
            disabled={loading}
            error={error?.field === 'confirmPassword'}
            sx={INPUT_SX}
          />
        </Box>

        <PasswordRequirements password={newPassword} historyRejected={historyRejected} />

        {error && <StatusMessage severity="error" message={error.message} />}

        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={BUTTON_SX}>
          {loading ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar nueva contraseña'}
        </Button>
      </Box>
    );
  }

  return (
    <AuthCardLayout>
      <RecoverySteps current={3} />

      <Box sx={{ p: { xs: '24px 16px', sm: '32px' }, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 460 }}>{content}</Box>
      </Box>
    </AuthCardLayout>
  );
}

export default NewPasswordPage;
