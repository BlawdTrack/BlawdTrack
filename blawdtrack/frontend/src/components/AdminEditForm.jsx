import { Box, TextField, Typography } from '@mui/material';
import AccessStatusPanel from './AccessStatusPanel';
import EditFormActions from './EditFormActions';
import OptionalPasswordField from './OptionalPasswordField';
import StatusMessage from './StatusMessage';
import { INPUT_SX, LABEL_SX } from './formStyles';

const FIELD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
  gap: { xs: 2, md: '20px 24px' },
  alignItems: 'start',
};

/**
 * Formulario de edición de un administrador (HU-007): nombre completo, correo, contraseña nueva opcional y estado de
 * acceso, con los botones de guardar siempre a la vista. Solo muestra y avisa; el estado y el guardado viven en
 * `useAdminEditor`. Equivale a `CourierEditForm`.
 * @param {{ editor: ReturnType<typeof import('../hooks/useAdminEditor').useAdminEditor>, onDiscard: Function }} props
 */
export default function AdminEditForm({ editor, onDiscard }) {
  const { formData, formErrors, updateError, submitting } = editor;
  const isActive = formData.status === 'ACTIVE';

  return (
    <Box component="form" noValidate onSubmit={editor.submit} aria-busy={submitting} sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={FIELD_GRID_SX}>
          <Box>
            <Typography component="label" htmlFor="admin-fullName" sx={LABEL_SX}>Nombre completo</Typography>
            <TextField
              fullWidth
              id="admin-fullName"
              name="fullName"
              value={formData.fullName}
              onChange={editor.change}
              error={Boolean(formErrors.fullName)}
              helperText={formErrors.fullName}
              placeholder="Nombre y apellidos"
              sx={INPUT_SX}
            />
          </Box>

          <Box>
            <Typography component="label" htmlFor="admin-email" sx={LABEL_SX}>Correo electrónico</Typography>
            <TextField
              fullWidth
              id="admin-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={editor.change}
              error={Boolean(formErrors.email)}
              helperText={formErrors.email}
              placeholder="correo@blawdgourmet.com"
              sx={INPUT_SX}
            />
          </Box>

          <OptionalPasswordField
            id="admin-password"
            value={formData.password}
            onChange={editor.change}
            error={formErrors.password}
            hint="Dejar vacío para no cambiar. Al cambiarla, su sesión activa se cierra."
          />
        </Box>

        <AccessStatusPanel
          isActive={isActive}
          revokedText="Revocado. El administrador no puede iniciar sesión."
          onToggle={editor.toggleStatus}
          disabled={submitting}
        />

        {updateError && <StatusMessage severity="error" message={updateError} />}
      </Box>

      <EditFormActions submitting={submitting} onDiscard={onDiscard} />
    </Box>
  );
}
