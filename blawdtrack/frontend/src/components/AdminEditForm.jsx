import { Box, Button, CircularProgress, Switch, TextField, Typography } from '@mui/material';
import StatusMessage from './StatusMessage';
import { INPUT_SX, LABEL_SX } from './formStyles';
import { CARD_PATTERN_SX, RADIUS, FONT, TOUCH_TARGET, rem } from '../theme';

const FIELD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
  gap: { xs: 2, md: '20px 24px' },
  alignItems: 'start',
};

const SWITCH_SX = {
  width: rem(46),
  height: rem(27),
  padding: 0,
  flex: `0 0 ${rem(46)}`,
  '& .MuiSwitch-switchBase': {
    padding: '0.1923rem',
    '&.Mui-checked': {
      transform: 'translateX(19px)',
      '& + .MuiSwitch-track': { backgroundColor: 'success.main', opacity: 1 },
    },
  },
  '& .MuiSwitch-thumb': { width: rem(21), height: rem(21), boxShadow: 2 },
  '& .MuiSwitch-track': { borderRadius: RADIUS.md, backgroundColor: 'neutral.borderStrong', opacity: 1 },
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

          <Box>
            <Typography component="label" htmlFor="admin-password" sx={LABEL_SX}>Nueva contraseña (opcional)</Typography>
            <TextField
              fullWidth
              id="admin-password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={editor.change}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password || 'Dejar vacío para no cambiar. Al cambiarla, su sesión activa se cierra.'}
              placeholder="••••••••"
              sx={INPUT_SX}
            />
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: 'neutral.surface',
            borderRadius: RADIUS.sm,
            p: '1rem 1.1154rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.8462rem',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.1923rem', minWidth: 0 }}>
            <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>Estado de acceso</Typography>
            <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.4 }}>
              {isActive
                ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.'
                : 'Revocado. El administrador no puede iniciar sesión.'}
            </Typography>
          </Box>
          <Switch
            checked={isActive}
            onChange={editor.toggleStatus}
            disabled={submitting}
            slotProps={{ input: { 'aria-label': 'Estado de acceso' } }}
            sx={SWITCH_SX}
          />
        </Box>

        {updateError && <StatusMessage severity="error" message={updateError} />}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'neutral.border', ...CARD_PATTERN_SX, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          sx={{ fontWeight: 600, px: 4, minHeight: TOUCH_TARGET, fontSize: FONT.md, borderRadius: RADIUS.sm }}
        >
          {submitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onDiscard}
          disabled={submitting}
          sx={{ color: 'primary.main', border: '1.5px solid', borderColor: 'neutral.borderStrong', fontWeight: 600, px: 3, minHeight: TOUCH_TARGET, fontSize: FONT.md, borderRadius: RADIUS.sm }}
        >
          Descartar
        </Button>
      </Box>
    </Box>
  );
}
