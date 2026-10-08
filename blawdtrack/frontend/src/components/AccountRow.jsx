import { Avatar, Box, Button, Typography } from '@mui/material';
import { getInitials } from '../utils/getInitials';
import { RADIUS, FONT } from '../theme';

const LINE_COLORS = { muted: 'text.secondary', success: 'success.main' };

/**
 * Fila de una cuenta (mensajero, administrador…) en una lista de acciones delicadas: avatar con iniciales,
 * nombre, líneas de detalle, una etiqueta de estado y un botón de acción en rojo.
 * @param {{ name: string, lines: Array<{ text: string, tone?: 'muted'|'success' }>, status: import('react').ReactNode,
 *   actionLabel: string, actionDisabled?: boolean, onAction: Function }} props La primera línea de detalle
 *   se muestra más grande; las siguientes, como apoyo.
 */
export default function AccountRow({ name, lines, status, actionLabel, actionDisabled = false, onAction }) {
  return (
    <Box sx={{ px: 2.5, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Avatar sx={{ width: 36, height: 36, bgcolor: 'neutral.surface', color: 'text.secondary', fontWeight: 700, fontSize: FONT.sm, flex: '0 0 36px' }}>
        {getInitials(name)}
      </Avatar>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <Typography sx={{ fontSize: FONT.md, fontWeight: 600, color: '#1F2421' }}>{name}</Typography>
        {lines.map((line, index) => (
          <Typography
            key={line.text}
            sx={{
              fontSize: index === 0 ? FONT.sm : FONT.xs,
              fontWeight: index === 0 ? 400 : 600,
              color: LINE_COLORS[line.tone ?? 'muted'],
              overflowWrap: 'anywhere',
            }}
          >
            {line.text}
          </Typography>
        ))}
      </Box>

      {status}

      <Button
        variant="outlined"
        disabled={actionDisabled}
        onClick={onAction}
        sx={{
          borderRadius: RADIUS.sm,
          px: 2.5,
          minHeight: 44,
          fontWeight: 600,
          fontSize: FONT.sm,
          bgcolor: 'background.paper',
          color: actionDisabled ? '#7A736A' : 'error.main',
          borderColor: actionDisabled ? 'neutral.border' : 'error.main',
          '&:hover': { bgcolor: actionDisabled ? 'background.paper' : 'error.light', borderColor: actionDisabled ? 'neutral.border' : 'error.main' },
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
