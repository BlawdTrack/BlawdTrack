import { useSearchParams } from 'react-router-dom';
import { Box } from '@mui/material';
import AuthSplitLayout from '../components/AuthSplitLayout';
import NewPasswordForm from '../components/NewPasswordForm';
import { NewPasswordInvalidLink, NewPasswordSuccess } from '../components/NewPasswordOutcomes';
import RecoveryProgress from '../components/RecoveryProgress';
import usePasswordResetConfirmation from '../hooks/usePasswordResetConfirmation';

const BRAND_TITLE = (
  <>
    Recupera tu acceso
    <br />
    <Box component="span" sx={{ color: 'secondary.main' }}>en 3 pasos.</Box>
  </>
);
const BRAND_SUBTITLE = 'Te enviamos un enlace de un solo uso al correo de tu cuenta.';

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
 * Pantalla "Crear nueva contraseña" (HU-002). Se abre desde el enlace del correo (`/recovery?token=...`) y solo
 * compone: el estado y el envío viven en `usePasswordResetConfirmation`, y cada vista (formulario, éxito y "enlace no
 * válido", por token ausente, usado o vencido) es un componente.
 * @param {{ onGoToLogin: Function, onRequestNewLink: Function }} props
 */
export function NewPasswordPage({ onGoToLogin, onRequestNewLink }) {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') ?? '').trim();
  const reset = usePasswordResetConfirmation(token);

  let content;
  if (reset.succeeded) {
    content = <NewPasswordSuccess onGoToLogin={onGoToLogin} />;
  } else if (!token || reset.tokenRejected) {
    content = <NewPasswordInvalidLink rejected={reset.tokenRejected} onRequestNewLink={onRequestNewLink} />;
  } else {
    content = <NewPasswordForm reset={reset} />;
  }

  return (
    <AuthSplitLayout brandTitle={BRAND_TITLE} brandSubtitle={BRAND_SUBTITLE}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RecoveryProgress current={3} onBackToLogin={onGoToLogin} />
        {content}
      </Box>
    </AuthSplitLayout>
  );
}

export default NewPasswordPage;
