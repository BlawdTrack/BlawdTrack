import { Chip } from '@mui/material';

/**
 * Etiqueta "Activo" / "Inactivo" del estado de acceso de una cuenta.
 * @param {{ active: boolean }} props
 */
export default function StatusChip({ active }) {
  return (
    <Chip
      label={active ? 'Activo' : 'Inactivo'}
      size="small"
      sx={{
        fontSize: 12,
        fontWeight: 700,
        borderRadius: '20px',
        bgcolor: active ? '#E9F3EC' : '#F1ECE7',
        color: active ? '#256B41' : '#6B6560',
      }}
    />
  );
}
