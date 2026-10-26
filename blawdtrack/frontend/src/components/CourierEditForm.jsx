import { Box, TextField, Typography } from '@mui/material';
import AccessStatusPanel from './AccessStatusPanel';
import EditFormActions from './EditFormActions';
import OptionalPasswordField from './OptionalPasswordField';
import { TimeWheelField } from './TimeWheelField';
import { WeightWheelField } from './WeightWheelField';
import StatusMessage from './StatusMessage';
import { INPUT_SX, LABEL_SX } from './formStyles';
import { FONT } from '../theme';

const FIELD_GRID_SX = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
  gap: { xs: 2, md: '20px 24px' },
  alignItems: 'start',
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

          <OptionalPasswordField
            id="courier-password"
            value={formData.password}
            onChange={editor.change}
            error={formErrors.password}
            hint="Dejar vacío para no cambiar"
          />
        </Box>

        <AccessStatusPanel
          isActive={isActive}
          revokedText="Revocado. El mensajero no puede iniciar sesión."
          onToggle={editor.toggleStatus}
          disabled={isStatusLocked}
        >
          {isStatusLocked && (
            <Typography sx={{ fontSize: FONT.sm, color: 'error.main', fontWeight: 600 }}>
              Solo puedes cambiar el estado fuera de labores y sin envíos en proceso.
            </Typography>
          )}
        </AccessStatusPanel>

        {updateError && <StatusMessage severity="error" message={updateError} />}
      </Box>

      <EditFormActions submitting={submitting} onDiscard={onDiscard} />
    </Box>
  );
}
