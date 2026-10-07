import { Avatar, Box, Button, Typography } from '@mui/material';
import { getInitials } from '../utils/getInitials';

const LINE_COLORS = { muted: '#6B6560', success: '#2F7D4F' };

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
      <Avatar sx={{ width: 44, height: 44, bgcolor: '#F1ECE7', color: '#6B6560', fontWeight: 700, fontSize: 14, flex: '0 0 44px' }}>
        {getInitials(name)}
      </Avatar>

      <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1F2421' }}>{name}</Typography>
        {lines.map((line, index) => (
          <Typography
            key={line.text}
            sx={{
              fontSize: index === 0 ? 14 : 12,
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
          borderRadius: '10px',
          px: 2.5,
          minHeight: 44,
          fontWeight: 600,
          fontSize: 14,
          bgcolor: '#fff',
          color: actionDisabled ? '#7A736A' : '#C0392B',
          borderColor: actionDisabled ? '#E4DED7' : '#C0392B',
          '&:hover': { bgcolor: actionDisabled ? '#fff' : '#FCEDEA', borderColor: actionDisabled ? '#E4DED7' : '#C0392B' },
        }}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
