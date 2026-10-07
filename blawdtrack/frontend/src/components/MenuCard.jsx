import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * Tarjeta de los menús (principal y de cada módulo): icono, título, descripción corta y una flecha que
 * indica que lleva a otra pantalla. Toda la tarjeta es el enlace (objetivo grande, ley de Fitts). Sin
 * `to` se muestra deshabilitada con el aviso "Próximamente".
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string, description?: string,
 *   meta?: string }} props `meta` es un dato breve bajo la descripción (por ejemplo, cuántas funciones tiene).
 */
export default function MenuCard({ to = null, icon: Icon, title, description, meta }) {
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true };

  return (
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        minHeight: 96,
        p: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid #E4DED7',
        borderRadius: '16px',
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        transition: 'border-color .15s ease, box-shadow .15s ease, transform .15s ease',
        ...(to && {
          '&:hover': { borderColor: 'secondary.main', boxShadow: '0 8px 24px rgba(26,60,52,.10)', transform: 'translateY(-1px)' },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 2 },
        }),
      }}
    >
      {Icon && (
        <Box
          sx={{
            flex: '0 0 48px',
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: '#FFE8D9',
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography component="h2" sx={{ fontWeight: 600, fontSize: 16, color: 'primary.main' }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: 13.5, color: 'text.secondary', mt: 0.25, lineHeight: 1.45 }}>{description}</Typography>
        )}
        {(meta || !to) && (
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mt: 0.75 }}>
            {to ? meta : 'Próximamente'}
          </Typography>
        )}
      </Box>
      {to && <ChevronRightIcon sx={{ color: 'text.secondary' }} />}
    </Box>
  );
}
