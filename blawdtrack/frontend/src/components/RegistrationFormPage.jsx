import { Box, Paper } from '@mui/material';
import PageHeaderBar from './PageHeaderBar';
import PageContainer from './PageContainer';
import StatusMessage from './StatusMessage';
import FormActions from './FormActions';
import ConfirmLeaveDialog from './ConfirmLeaveDialog';
import UnsavedChangesGuard from './UnsavedChangesGuard';
import { CARD_SX } from './formStyles';

/**
 * Estructura común de las pantallas de creación (mensajero, administrador): encabezado, tarjeta con el
 * formulario en dos columnas, aviso de error del servidor, botones de enviar y descartar, y la protección
 * contra salir con datos sin guardar. Los campos van como hijos.
 * @param {{ title: string, description: string, onSubmit: Function, form: object, isSubmitting: boolean,
 *   submitLabel: string, submittingLabel: string, globalMessage?: string|null, severity?: string,
 *   children: import('react').ReactNode }} props `form` es el `form` de `useRegistrationForm`.
 */
export default function RegistrationFormPage({
  title,
  description,
  onSubmit,
  form,
  isSubmitting,
  submitLabel,
  submittingLabel,
  globalMessage,
  severity,
  children,
}) {
  return (
    <>
      <PageHeaderBar title={title} description={description} />
      <PageContainer>
        <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2.5, md: 4 }, textAlign: 'left' }}>
          <Box component="form" noValidate onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {globalMessage && <StatusMessage severity={severity} message={globalMessage} />}

            <Box
              sx={{
                display: 'grid',
                gap: { xs: 2, md: '24px 32px' },
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                alignItems: 'start',
              }}
            >
              {children}
            </Box>

            <FormActions
              submitLabel={submitLabel}
              submittingLabel={submittingLabel}
              isSubmitting={isSubmitting}
              onDiscard={form.discard}
            />
          </Box>
        </Paper>
      </PageContainer>

      <UnsavedChangesGuard when={form.shouldBlock} />
      <ConfirmLeaveDialog {...form.dialogProps} />
    </>
  );
}
