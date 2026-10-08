import { Box, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { RADIUS } from '../theme';

/**
 * Botón al pie de una lista que abre su historial o auditoría ("Ver historial general", "Ver auditoría"…).
 * Ocupa todo el ancho de su panel y queda marcado cuando ese historial ya está abierto.
 * @param {{ label: string, onClick: Function, active?: boolean }} props
 */
export default function HistoryButton({ label, onClick, active = false }) {
  return (
    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'neutral.border' }}>
      <Button
        fullWidth
        variant={active ? 'contained' : 'outlined'}
        disableElevation
        onClick={onClick}
        startIcon={<HistoryIcon />}
        sx={{ minHeight: 44, fontWeight: 600, borderRadius: RADIUS.sm, ...(!active && { color: 'primary.main', border: '1.5px solid', borderColor: 'neutral.borderStrong' }) }}
      >
        {label}
      </Button>
    </Box>
  );
}
