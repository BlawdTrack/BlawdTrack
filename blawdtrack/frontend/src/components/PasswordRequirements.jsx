import { Box, Typography } from '@mui/material';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { evaluatePasswordRules } from '../utils/passwordRules';
import { REDUCED_MOTION_SX } from './authStyles';
import { FONT, rem } from '../theme';

// Requisitos de la nueva contraseña. Las reglas de largo, letra y número se evalúan en vivo con lo que el usuario
// escribe: cada una es un círculo vacío que pasa a un check verde al cumplirse. La de "distinta de las últimas 3
// contraseñas" no se puede validar en el cliente (no tiene el historial), así que va como una nota que solo se pone en
// rojo cuando el propio backend la rechazó (`historyRejected`, tras un CONTRASENA_REUTILIZADA).
const OK_COLOR = 'success.main';
const NEUTRAL_RING = 'neutral.borderStrong';

const VISUALLY_HIDDEN = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function Rule({ label, met }) {
  return (
    <Box
      component="li"
      sx={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 1.25, fontSize: FONT.lg, lineHeight: 1.35, color: met ? 'text.primary' : 'text.secondary' }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          width: rem(18),
          height: rem(18),
          flex: `0 0 ${rem(18)}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: met ? OK_COLOR : 'transparent',
          color: 'common.white',
          border: '1.5px solid',
          borderColor: met ? OK_COLOR : NEUTRAL_RING,
          transition: 'background-color .15s ease, border-color .15s ease',
          ...REDUCED_MOTION_SX,
        }}
      >
        {met && <CheckOutlinedIcon sx={{ fontSize: rem(13) }} />}
      </Box>
      <span>
        {label}
        <Box component="span" sx={VISUALLY_HIDDEN}>
          : {met ? 'Cumplido' : 'Pendiente'}
        </Box>
      </span>
    </Box>
  );
}

/**
 * Requisitos de la nueva contraseña, en vivo bajo el campo, y la nota de las últimas 3 contraseñas.
 * @param {{ password: string, historyRejected?: boolean }} props `historyRejected` pone en rojo la nota de "distinta
 *   de las últimas 3 contraseñas" cuando el backend la rechazó.
 */
export function PasswordRequirements({ password, historyRejected = false }) {
  const results = evaluatePasswordRules(password);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography id="password-requirements-title" sx={VISUALLY_HIDDEN}>
        Requisitos de la contraseña
      </Typography>
      <Box
        component="ul"
        aria-labelledby="password-requirements-title"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        <Rule label="Mínimo 8 caracteres" met={results.length} />
        <Rule label="Al menos una letra" met={results.letter} />
        <Rule label="Al menos un número" met={results.number} />
      </Box>
      <Typography sx={{ fontSize: FONT.md, lineHeight: 1.45, color: historyRejected ? 'error.main' : 'text.secondary' }}>
        También debe ser distinta de tus últimas 3 contraseñas (se verifica al guardar).
      </Typography>
    </Box>
  );
}

export default PasswordRequirements;
