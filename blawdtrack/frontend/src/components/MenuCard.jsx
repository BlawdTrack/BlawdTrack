import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import { CARD_PATTERN_SX, RADIUS } from '../theme';

// Tarjeta alta y centrada (menús de módulo): icono en cuadro arriba, texto al centro, flecha abajo.
const CARD_VARIANT_SX = {
  flexDirection: { xs: 'row', md: 'column' },
  justifyContent: { xs: 'flex-start', md: 'center' },
  textAlign: { xs: 'left', md: 'center' },
  gap: { xs: 2, md: 2.5 },
  minHeight: { xs: 96, md: 260 },
  p: { xs: 2.5, md: 4 },
  borderRadius: RADIUS.lg,
};

// Fila ancha (menú principal): barra naranja a la izquierda, icono sin cuadro, texto alineado a la izquierda
// y la acción "Abrir" a la derecha.
const ROW_VARIANT_SX = {
  flexDirection: 'row',
  justifyContent: 'flex-start',
  textAlign: 'left',
  gap: { xs: 2, md: 3 },
  minHeight: 88,
  px: { xs: 2, md: 3 },
  py: 2.5,
  borderRadius: RADIUS.md,
  borderLeft: '6px solid',
  borderLeftColor: 'secondary.main',
};

/**
 * Tarjeta de los menús (principal y de cada módulo): icono, título y descripción corta. Toda la tarjeta
 * es el enlace (objetivo grande, ley de Fitts). Con `variant="card"` (por defecto) es una tarjeta alta con
 * el contenido centrado que en móvil se compacta en una fila; con `variant="row"` es una fila ancha con el
 * texto a la izquierda y la acción "Abrir" a la derecha. Sin `to` se muestra deshabilitada con el aviso
 * "Próximamente".
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string,
 *   description?: string, variant?: 'card'|'row' }} props
 */
export default function MenuCard({ to = null, icon: Icon, title, description, variant = 'card' }) {
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true };
  const isRow = variant === 'row';

  return (
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        ...CARD_PATTERN_SX,
        border: '1px solid', borderColor: 'neutral.border',
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        transition: 'border-color .15s ease, box-shadow .15s ease, transform .15s ease',
        ...(isRow ? ROW_VARIANT_SX : CARD_VARIANT_SX),
        ...(to && {
          '&:hover': {
            borderColor: 'secondary.main',
            boxShadow: 8,
            transform: 'translateY(-2px)',
            '& .menu-card-arrow': isRow
              ? { transform: 'translateX(4px)' }
              : { bgcolor: 'secondary.main', color: 'primary.main' },
          },
          '&:focus-visible': { outline: '2px solid #FF6C0E', outlineOffset: 2 },
        }),
      }}
    >
      {Icon && (
        <Box
          sx={
            isRow
              ? {
                  flex: '0 0 auto',
                  color: 'primary.main',
                  display: 'flex',
                  '& svg': { fontSize: { xs: 32, md: 40 } },
                }
              : {
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
                }
          }
        >
          <Icon />
        </Box>
      )}
      <Box sx={{ flex: isRow ? 1 : { xs: 1, md: '0 1 auto' }, minWidth: 0 }}>
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
      {to && isRow && (
        <Box
          className="menu-card-arrow"
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            color: 'primary.main',
            transition: 'transform .15s ease',
          }}
        >
          <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' }, fontSize: 14, fontWeight: 600 }}>
            Abrir
          </Typography>
          <ArrowForwardOutlinedIcon fontSize="small" />
        </Box>
      )}
      {to && !isRow && (
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
          <ArrowForwardOutlinedIcon fontSize="small" />
        </Box>
      )}
    </Box>
  );
}
