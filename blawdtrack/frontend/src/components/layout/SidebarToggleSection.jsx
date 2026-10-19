import { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { RADIUS, FONT } from '../../theme';

/**
 * Sección plegable de la barra lateral expandida: un título que abre y cierra la lista de lo que contiene
 * (arranca cerrada y, si la pantalla actual es de la sección, la marca con un punto naranja). El título de un menú
 * va en blanco crema y el de un submenú (`nested`), en gris. La usan los grupos
 * del menú y, dentro de Gestión de usuarios, cada submenú (Mensajeros, Administradores) con `nested`.
 * @param {{ id: string, title: string, active?: boolean, nested?: boolean, children: import('react').ReactNode }} props
 *   `id` identifica la lista que controla el botón (`aria-controls`); `nested` sangra la sección.
 */
export default function SidebarToggleSection({ id, title, active = false, nested = false, children }) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.1154rem' }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={id}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 44,
          '@media (pointer: fine)': { minHeight: nested ? 34 : 38 },
          pl: nested ? 3 : 1.5,
          pr: 1.5,
          border: 0,
          borderRadius: RADIUS.sm,
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
          // Etiqueta en minúsculas y alineada a la izquierda: en mayúsculas espaciadas se partía en dos líneas.
          textAlign: 'left',
          fontSize: FONT.sm,
          fontWeight: 600,
          letterSpacing: 0,
          // El título del menú va en blanco crema; los submenús que cuelgan de él, en gris.
          color: nested ? 'rgba(255,255,255,.65)' : '#FAF8F5',
          '&:hover': { color: '#FAF8F5', backgroundColor: 'rgba(255,255,255,.05)' },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 1 },
        }}
      >
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {title}
          {active && (
            <Box component="span" aria-hidden="true" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'secondary.main' }} />
          )}
        </Box>
        <ExpandMoreOutlinedIcon
          sx={{ fontSize: FONT.lg, transition: 'transform .2s ease', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
      </Box>
      <Collapse in={open} id={id}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.1154rem', pl: nested ? 1.5 : 0 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}
