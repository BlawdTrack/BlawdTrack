import { Box, Typography } from '@mui/material';
import { evaluatePasswordRules } from '../utils/passwordRules';

// Checklist "Requisitos" (bloque r3 del mockup). Las reglas 1-3 se evalúan en
// vivo con lo que el usuario escribe. La regla 4 (distinta de las últimas 3
// contraseñas) se queda SIEMPRE en estado neutro: el cliente no puede saberlo.
// Solo pasa a "no cumplida" cuando el propio backend la rechazó
// (`historyRejected`, tras un CONTRASENA_REUTILIZADA).
const OK_COLOR = '#2F7D4F';
const ERROR_COLOR = '#C0392B';
const NEUTRAL_TEXT = '#9E968D';
const NEUTRAL_RING = '#DCD4CA';

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function Rule({ label, state, note }) {
  const color = state === 'ok' ? OK_COLOR : state === 'failed' ? ERROR_COLOR : NEUTRAL_TEXT;
  const statusText =
    state === 'ok' ? 'Cumplido' : state === 'failed' ? 'No cumplido' : 'Pendiente';

  return (
    <Box
      component="li"
      sx={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: 12.5, lineHeight: 1.35, color }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 15,
          height: 15,
          flex: '0 0 15px',
          borderRadius: '50%',
          bgcolor: state === 'ok' ? OK_COLOR : 'transparent',
          border: `1.5px solid ${state === 'ok' ? OK_COLOR : state === 'failed' ? ERROR_COLOR : NEUTRAL_RING}`,
        }}
      />
      <span>
        {label}
        {note && (
          <Box component="span" sx={{ ml: 0.75, fontSize: 11.5, color: NEUTRAL_TEXT }}>
            ({note})
          </Box>
        )}
        <Box component="span" sx={VISUALLY_HIDDEN}>
          : {statusText}
        </Box>
      </span>
    </Box>
  );
}

export function PasswordRequirements({ password, historyRejected = false }) {
  const results = evaluatePasswordRules(password);

  return (
    <Box
      sx={{
        bgcolor: '#F1ECE7',
        borderRadius: '12px',
        p: '15px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
      }}
    >
      <Typography
        id="password-requirements-title"
        sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.9px', textTransform: 'uppercase', color: '#6B6560' }}
      >
        Requisitos
      </Typography>
      <Box
        component="ul"
        aria-labelledby="password-requirements-title"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}
      >
        <Rule label="Mínimo 8 caracteres" state={results.length ? 'ok' : 'pending'} />
        <Rule label="Al menos una mayúscula" state={results.uppercase ? 'ok' : 'pending'} />
        <Rule label="Al menos un número" state={results.number ? 'ok' : 'pending'} />
        <Rule
          label="Distinta de las últimas 3 contraseñas"
          state={historyRejected ? 'failed' : 'pending'}
          note={historyRejected ? undefined : 'se verifica al guardar'}
        />
      </Box>
    </Box>
  );
}

export default PasswordRequirements;
