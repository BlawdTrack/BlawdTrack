import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CARD_PATTERN_SX, RADIUS } from '../theme';

/**
 * Tarjeta de los menús (principal y de cada módulo): icono, título y descripción corta. Toda la tarjeta
 * es el enlace (objetivo grande, ley de Fitts). En escritorio es una tarjeta alta con el contenido
 * centrado; en móvil se compacta en una fila. Sin `to` se muestra deshabilitada con el aviso
 * "Próximamente".
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string,
 *   description?: string }} props
 */
export default function MenuCard({ to = null, icon: Icon, title, description }) {
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true };

  return (
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'row', md: 'column' },
        alignItems: 'center',
        justifyContent: { xs: 'flex-start', md: 'center' },
        textAlign: { xs: 'left', md: 'center' },
        gap: { xs: 2, md: 2.5 },
        minHeight: { xs: 96, md: 260 },
        p: { xs: 2.5, md: 4 },
        ...CARD_PATTERN_SX,
        border: '1px solid', borderColor: 'neutral.border',
        borderRadius: RADIUS.lg,
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        transition: 'border-color .15s ease, box-shadow .15s ease, transform .15s ease',
        ...(to && {
          '&:hover': {
            borderColor: 'secondary.main',
            boxShadow: 8,
            transform: 'translateY(-2px)',
            '& .menu-card-arrow': { bgcolor: 'secondary.main', color: 'common.white' },
          },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 2 },
        }),
      }}
    >
      {Icon && (
        <Box
          sx={{
            flex: { xs: '0 0 48px', md: '0 0 72px' },
            width: { xs: 48, md: 72 },
            height: { xs: 48, md: 72 },
            borderRadius: { xs: RADIUS.sm, md: RADIUS.md },
            bgcolor: 'secondary.light',
            color: 'secondary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& svg': { fontSize: { xs: 24, md: 36 } },
          }}
        >
          <Icon />
        </Box>
      )}
      <Box sx={{ flex: { xs: 1, md: '0 1 auto' }, minWidth: 0 }}>
        <Typography component="h2" sx={{ fontWeight: 600, fontSize: { xs: 16, md: 20 }, color: 'primary.main' }}>
          {title}
        </Typography>
        {description && (
          <Typography sx={{ fontSize: { xs: 14, md: 16 }, color: 'text.secondary', mt: 0.5, lineHeight: 1.5 }}>
            {description}
          </Typography>
        )}
        {!to && (
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.secondary', mt: 1 }}>Próximamente</Typography>
        )}
      </Box>
      {to && (
        <Box
          className="menu-card-arrow"
          sx={{
            flex: '0 0 auto',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'neutral.surface',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: { xs: 0, md: 'auto' },
            transition: 'background-color .15s ease, color .15s ease',
          }}
        >
          <ArrowForwardIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}
