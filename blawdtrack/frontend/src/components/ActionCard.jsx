import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { FONT, RADIUS, rem, fontPx } from '../theme';

// Colores de cada tono: el del icono en reposo (fondo suave y tinta) y el que toma al pasar el cursor.
const TONES = {
  default: { soft: 'secondary.light', ink: 'secondary.text', accent: 'secondary.main' },
  danger: { soft: 'error.light', ink: 'error.main', accent: 'error.main' },
};

/**
 * Tarjeta de función de los menús de módulo: icono en cuadro suave, título, descripción (máximo tres líneas) y
 * un pie con la acción en pocas palabras y una flecha circular. Toda la tarjeta es el enlace. Las acciones que
 * quitan o eliminan algo usan `tone="danger"` (rojo). Sin `to` se muestra deshabilitada con el aviso
 * "Próximamente".
 * @param {{ to?: string|null, icon?: import('react').ElementType, title: string, description?: string,
 *   actionLabel?: string, tone?: 'default'|'danger' }} props
 */
export default function ActionCard({ to = null, icon: Icon, title, description, actionLabel, tone = 'default' }) {
  const linkProps = to ? { component: RouterLink, to } : { 'aria-disabled': true };
  const colors = TONES[tone];

  return (
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'common.white',
        border: '1.5px solid',
        borderColor: 'neutral.border',
        borderRadius: rem(18),
        p: { xs: 2.75, md: 3.5 },
        color: 'text.primary',
        textDecoration: 'none',
        opacity: to ? 1 : 0.6,
        cursor: to ? 'pointer' : 'not-allowed',
        boxShadow: '0 1px 0 rgba(26,60,52,.04)',
        transition: 'border-color .18s ease, box-shadow .18s ease',
        ...(to && {
          '&:hover': {
            borderColor: colors.accent,
            boxShadow: '0 10px 24px -14px rgba(26,60,52,.35)',
            '& .action-card-icon': { bgcolor: colors.accent, color: 'common.white' },
          },
          '&:focus-visible': { outline: '3px solid #1A3C34', outlineOffset: 3 },
        }),
      }}
    >
      {Icon && (
        <Box
          className="action-card-icon"
          sx={{
            width: rem(56),
            height: rem(56),
            borderRadius: RADIUS.md,
            bgcolor: colors.soft,
            color: colors.ink,
            display: 'grid',
            placeItems: 'center',
            transition: 'background-color .18s ease, color .18s ease',
            '& svg': { fontSize: fontPx(28) },
          }}
        >
          <Icon />
        </Box>
      )}
      <Typography component="h2" sx={{ mt: 2.75, fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: fontPx(20), lineHeight: 1.25, color: 'primary.main' }}>
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            mt: 1,
            fontSize: FONT.lg,
            lineHeight: 1.55,
            color: 'text.secondary',
            // Máximo tres líneas, para que ninguna tarjeta se alargue más que las demás.
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Typography>
      )}
      {/* El pie va siempre abajo, así la acción queda alineada aunque el texto tenga distinto largo. */}
      <Box sx={{ mt: 'auto', pt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Typography component="span" sx={{ fontWeight: 600, fontSize: FONT.md, color: 'primary.main' }}>
          {to ? actionLabel : 'Próximamente'}
        </Typography>
      </Box>
    </Box>
  );
}
