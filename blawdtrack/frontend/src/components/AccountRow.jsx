import { Avatar, Box, Button, Typography } from '@mui/material';
import { getInitials } from '../utils/getInitials';
import { RADIUS, FONT, rem } from '../theme';

const LINE_COLORS = { muted: 'text.secondary', success: 'success.main' };

/**
 * Fila de una cuenta (mensajero, administrador…) en una lista de acciones delicadas: avatar con iniciales,
 * nombre, líneas de detalle, una etiqueta de estado y un botón de acción: rojo si es destructiva (eliminar, desactivar)
 * o verde de marca si solo abre algo (editar).
 * @param {{ name: string, lines: Array<{ text: string, tone?: 'muted'|'success' }>, status: import('react').ReactNode,
 *   actionLabel: string, actionDisabled?: boolean, actionTone?: 'danger'|'primary', onAction: Function }} props
 *   La primera línea de detalle
 *   se muestra más grande; las siguientes, como apoyo.
 */
export default function AccountRow({ name, lines, status, actionLabel, actionDisabled = false, actionTone = 'danger', onAction }) {
  const accent = actionTone === 'primary' ? 'primary.main' : 'error.main';
  const hover = actionTone === 'primary' ? 'neutral.surface' : 'error.light';
  return (
    <Box sx={{ px: 2.5, py: 1.75, borderTop: '1px solid #EFEAE4', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Avatar sx={{ width: rem(36), height: rem(36), bgcolor: 'neutral.surface', color: 'text.secondary', fontWeight: 700, fontSize: FONT.sm, flex: `0 0 ${rem(36)}` }}>
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
          color: actionDisabled ? '#7A736A' : accent,
          borderColor: actionDisabled ? 'neutral.border' : accent,
          '&:hover': { bgcolor: actionDisabled ? 'background.paper' : hover, borderColor: actionDisabled ? 'neutral.border' : accent },
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
