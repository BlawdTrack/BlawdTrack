import { Chip } from '@mui/material';

/**
 * Etiqueta de si una cuenta tiene la sesión abierta ("Sesión activa" en ámbar) o no ("Sin sesión").
 * @param {{ active: boolean }} props
 */
export default function SessionChip({ active }) {
  return (
    <Chip
      label={active ? 'Sesión activa' : 'Sin sesión'}
      size="small"
      sx={{
        fontSize: 12,
        fontWeight: 700,
        borderRadius: '20px',
        bgcolor: active ? '#FCF3E3' : '#F1ECE7',
        color: active ? '#B27A0C' : '#6B6560',
        transition: 'background-color .4s ease, color .4s ease',
      }}
    />
  );
}
