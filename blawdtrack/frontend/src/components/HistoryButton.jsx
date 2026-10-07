import { Box, Button } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';

/**
 * Botón al pie de una lista que abre su historial o auditoría ("Ver historial general", "Ver auditoría"…).
 * Ocupa todo el ancho de su panel y queda marcado cuando ese historial ya está abierto.
 * @param {{ label: string, onClick: Function, active?: boolean }} props
 */
export default function HistoryButton({ label, onClick, active = false }) {
  return (
    <Box sx={{ p: 2, borderTop: '1px solid #E4DED7' }}>
      <Button
        fullWidth
        variant={active ? 'contained' : 'outlined'}
        disableElevation
        onClick={onClick}
        startIcon={<HistoryIcon />}
        sx={{ minHeight: 44, fontWeight: 600, borderRadius: '10px', ...(!active && { color: 'primary.main', border: '1.5px solid #DCD4CA' }) }}
      >
        {label}
      </Button>
    </Box>
  );
}
