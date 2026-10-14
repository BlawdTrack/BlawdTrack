import { NavLink } from 'react-router-dom';
import { Box, Tooltip, Typography } from '@mui/material';
import { RADIUS, FONT } from '../../theme';

// Gris de las opciones que cuelgan de un título de menú, y crema para el título y para la opción activa.
const MUTED = 'rgba(255,255,255,.65)';
const CREAM = '#FAF8F5';

function ItemContent({ label, active, disabled }) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 44,
        // Con mouse (puntero fino) la fila es más baja; con pantalla táctil se queda en 44 px.
        '@media (pointer: fine)': { minHeight: 36 },
        // Sin icono: la jerarquía se marca con la sangría (alineada con los títulos de sección) y el color.
        pl: 3,
        pr: 1.75,
        borderRadius: RADIUS.sm,
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        backgroundColor: active ? 'rgba(255,108,14,.18)' : 'transparent',
        transition: 'background-color .15s ease',
        '&:hover': { backgroundColor: disabled ? 'transparent' : active ? 'rgba(255,108,14,.18)' : 'rgba(255,255,255,.08)' },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-3px',
          top: '20%',
          bottom: '20%',
          width: '3px',
          borderRadius: '3px',
          backgroundColor: active ? '#FF6C0E' : 'transparent',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: FONT.sm,
          fontWeight: active ? 600 : 500,
          color: active ? CREAM : disabled ? 'rgba(255,255,255,.4)' : MUTED,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/**
 * Una opción del menú lateral expandido: solo texto, en gris (crema si es la pantalla activa), sin icono. Si no tiene
 * ruta (`path: null`) se muestra deshabilitada con el aviso "Disponible próximamente"; si la tiene, resalta cuando es
 * la ruta activa.
 * @param {{ item: { id: string, label: string, path: string|null } }} props
 */
export default function SidebarNavItem({ item }) {
  if (!item.path) {
    return (
      <Tooltip title="Disponible próximamente" placement="right" arrow>
        <span>
          <ItemContent label={item.label} active={false} disabled />
        </span>
      </Tooltip>
    );
  }

  return (
    <NavLink to={item.path} end className="sidebar-nav-link" style={{ textDecoration: 'none' }}>
      {({ isActive }) => <ItemContent label={item.label} active={isActive} disabled={false} />}
    </NavLink>
  );
}
