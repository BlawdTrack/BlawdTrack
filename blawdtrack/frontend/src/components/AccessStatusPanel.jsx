import { Box, Switch, Typography } from '@mui/material';
import { RADIUS, FONT, rem } from '../theme';

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
    '&.Mui-disabled': { opacity: 0.55 },
    '&.Mui-disabled + .MuiSwitch-track': { opacity: 0.55 },
  },
  '& .MuiSwitch-thumb': { width: rem(21), height: rem(21), boxShadow: 2 },
  '& .MuiSwitch-track': { borderRadius: RADIUS.md, backgroundColor: 'neutral.borderStrong', opacity: 1 },
};

/**
 * Tarjeta "Estado de acceso" de los formularios de edición de cuentas: dice si la cuenta puede iniciar sesión y deja
 * habilitarla o revocarla con un interruptor.
 * @param {{ isActive: boolean, revokedText: string, onToggle: Function, disabled?: boolean,
 *   children?: import('react').ReactNode }} props `revokedText` es lo que se lee cuando está revocado; `children` es
 *   un aviso extra bajo el texto (por ejemplo, por qué el interruptor está bloqueado).
 */
export default function AccessStatusPanel({ isActive, revokedText, onToggle, disabled = false, children }) {
  return (
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
          {isActive ? 'Habilitado. Al revocarlo, la sesión activa se cierra de inmediato.' : revokedText}
        </Typography>
        {children}
      </Box>
      <Switch
        checked={isActive}
        onChange={onToggle}
        disabled={disabled}
        slotProps={{ input: { 'aria-label': 'Estado de acceso' } }}
        sx={SWITCH_SX}
      />
    </Box>
  );
}
