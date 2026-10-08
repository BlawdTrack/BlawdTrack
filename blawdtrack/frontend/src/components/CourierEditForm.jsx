import { Box, Button, CircularProgress, Switch, TextField, Typography } from '@mui/material';
import { TimeWheelField } from './TimeWheelField';
import { WeightWheelField } from './WeightWheelField';
import StatusMessage from './StatusMessage';
import { INPUT_SX, LABEL_SX } from './formStyles';
import { CARD_PATTERN_SX, RADIUS, FONT, TOUCH_TARGET } from '../theme';

const FIELD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
  gap: { xs: 2, md: '20px 24px' },
  alignItems: 'start',
};

const SWITCH_SX = {
  width: 46,
  height: 27,
  padding: 0,
  flex: '0 0 46px',
  '& .MuiSwitch-switchBase': {
    padding: '2.5px',
    '&.Mui-checked': {
      transform: 'translateX(19px)',
      '& + .MuiSwitch-track': { backgroundColor: 'success.main', opacity: 1 },
    },
    '&.Mui-disabled': { opacity: 0.55 },
    '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.55 },
  },
  '& .MuiSwitch-thumb': { width: 21, height: 21, boxShadow: 2 },
  '& .MuiSwitch-track': { borderRadius: RADIUS.md, backgroundColor: 'neutral.borderStrong', opacity: 1 },
};

function FieldError({ children }) {
  if (!children) return null;
  return (
    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, mx: 1.75 }}>
      {children}
    </Typography>
  );
}

/**
 * Formulario de edición de un mensajero: datos, horario, capacidad, contraseña nueva opcional y estado de
 * acceso, con los botones de guardar siempre a la vista. Solo muestra y avisa; el estado y el guardado
 * viven en `useCourierEditor`.
 * @param {{ editor: ReturnType<typeof import('../hooks/useCourierEditor').useCourierEditor>,
 *   onDiscard: Function }} props
 */
export default function CourierEditForm({ editor, onDiscard }) {
  const { formData, formErrors, updateError, submitting, isStatusLocked } = editor;
  const isActive = formData.status === 'ACTIVE';

  return (
    <Box component="form" onSubmit={editor.submit} sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={FIELD_GRID_SX}>
          <Box>
            <Typography sx={LABEL_SX}>Nombre completo</Typography>
            <TextField
              fullWidth
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
            <Typography sx={LABEL_SX}>Correo electrónico</Typography>
            <TextField
              fullWidth
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
            <Typography sx={LABEL_SX}>Teléfono</Typography>
            <TextField
              fullWidth
              name="phone"
              value={formData.phone}
              onChange={editor.change}
              error={Boolean(formErrors.phone)}
              helperText={formErrors.phone}
              placeholder="Ej. 8888 8888"
              sx={INPUT_SX}
            />
          </Box>

          <Box>
            <Typography sx={LABEL_SX}>Horario</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeWheelField
                id="scheduleStart"
                label="Hora de entrada"
                value={formData.scheduleStart}
                error={Boolean(formErrors.schedule)}
                onChange={(value) => editor.changeSchedule('scheduleStart', value)}
              />
              <Typography component="span" sx={{ color: 'text.secondary' }}>a</Typography>
              <TimeWheelField
                id="scheduleEnd"
                label="Hora de salida"
                value={formData.scheduleEnd}
                error={Boolean(formErrors.schedule)}
                onChange={(value) => editor.changeSchedule('scheduleEnd', value)}
              />
            </Box>
            {formData.schedule && !formData.scheduleStart && (
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5, mx: 1.75, color: 'text.secondary' }}>
                Horario actual: {formData.schedule}. Elige las horas para cambiarlo.
              </Typography>
            )}
            <FieldError>{formErrors.schedule}</FieldError>
          </Box>

          <Box>
            <Typography sx={LABEL_SX}>Capacidad máxima de carga (kg)</Typography>
            <WeightWheelField
              id="maxLoadCapacityKg"
              label="Capacidad máxima de carga"
              value={formData.maxLoadCapacityKg}
              error={Boolean(formErrors.maxLoadCapacityKg)}
              onChange={(value) => editor.change({ target: { name: 'maxLoadCapacityKg', value } })}
            />
            <FieldError>{formErrors.maxLoadCapacityKg}</FieldError>
          </Box>

          <Box>
            <Typography sx={LABEL_SX}>Nueva contraseña (opcional)</Typography>
            <TextField
              fullWidth
              type="password"
              name="password"
              value={formData.password}
              onChange={editor.change}
              error={Boolean(formErrors.password)}
              helperText={formErrors.password || 'Dejar vacío para no cambiar'}
              placeholder="••••••••"
              sx={INPUT_SX}
            />
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: 'neutral.surface',
            borderRadius: RADIUS.sm,
            p: '13px 14.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '11px',
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5px', minWidth: 0 }}>
            <Typography sx={{ fontSize: FONT.sm, fontWeight: 600, color: '#1F2421' }}>Estado de acceso</Typography>
            <Typography sx={{ fontSize: FONT.sm, color: 'text.secondary', lineHeight: 1.4 }}>
              {isActive
                ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.'
                : 'Revocado. El mensajero no puede iniciar sesión.'}
            </Typography>
            {isStatusLocked && (
              <Typography sx={{ fontSize: FONT.sm, color: 'error.main', fontWeight: 600 }}>
                Solo puedes cambiar el estado fuera de labores y sin envíos en proceso.
              </Typography>
            )}
          </Box>
          <Switch
            checked={isActive}
            onChange={editor.toggleStatus}
            disabled={isStatusLocked}
            inputProps={{ 'aria-label': 'Estado de acceso' }}
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
