import { Box } from '@mui/material';
import AuthSplitLayout from '../components/AuthSplitLayout';
import RecoveryEmailSent from '../components/RecoveryEmailSent';
import RecoveryProgress from '../components/RecoveryProgress';
import RecoveryRequestForm from '../components/RecoveryRequestForm';
import { Toast } from '../components/Toast';
import usePasswordRecoveryRequest from '../hooks/usePasswordRecoveryRequest';

const BRAND_TITLE = (
  <>
    Recupera tu acceso
    <br />
    <Box component="span" sx={{ color: 'secondary.main' }}>en 3 pasos.</Box>
  </>
);
const BRAND_SUBTITLE = 'Te enviamos un enlace de un solo uso al correo de tu cuenta.';

/**
 * Pantalla "Recuperar contraseña" (HU-002 / T04, #65): una pantalla con dos vistas del mismo flujo (r1 y r2 del
 * bloque `hu002` del mockup), el formulario y la confirmación "Revisa tu correo". Solo compone: el estado y el envío
 * viven en `usePasswordRecoveryRequest`, que decide la vista con `sentEmail`.
 * @param {{ onBackToLogin: Function }} props
 */
export function PasswordRecoveryRequestPage({ onBackToLogin }) {
  const request = usePasswordRecoveryRequest();
  const { sentEmail, toast, closeToast } = request;

  return (
    <AuthSplitLayout brandTitle={BRAND_TITLE} brandSubtitle={BRAND_SUBTITLE}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <RecoveryProgress current={sentEmail ? 2 : 1} onBackToLogin={onBackToLogin} />

        {sentEmail === null ? <RecoveryRequestForm request={request} /> : <RecoveryEmailSent request={request} />}
      </Box>
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={closeToast} />
    </AuthSplitLayout>
  );
}

export default PasswordRecoveryRequestPage;
