import { Box, Typography } from '@mui/material';
import { RADIUS, FONT, fontPx } from '../theme';

const ORANGE = '#FF6C0E';

/**
 * Ilustración de ruta del banner: círculos concéntricos como un radar, una ruta punteada con dos paradas y el pin
 * de destino. Es decorativa, por eso va oculta a los lectores de pantalla.
 */
function RouteIllustration() {
  return (
    <svg
      viewBox="0 0 560 220"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 'min(560px, 62%)' }}
    >
      <g fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1.5">
        <circle cx="440" cy="110" r="50" />
        <circle cx="440" cy="110" r="105" />
        <circle cx="440" cy="110" r="165" />
      </g>
      <path
        d="M12 200 C 90 178, 120 96, 200 88 S 330 128, 396 112 S 440 112, 462 108"
        fill="none"
        stroke={ORANGE}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0.1 12"
      />
      {[
        [200, 88],
        [396, 112],
      ].map(([cx, cy]) => (
        <g key={cx}>
          <circle cx={cx} cy={cy} r="8" fill="#FFFFFF" />
          <circle cx={cx} cy={cy} r="3.5" fill="#1A3C34" />
        </g>
      ))}
      <g transform="translate(462 80)">
        <path
          d="M0 -48 C-26 -48 -42 -28 -42 -6 C-42 24 0 64 0 64 C0 64 42 24 42 -6 C42 -28 26 -48 0 -48 Z"
          fill={ORANGE}
        />
        <circle cx="0" cy="-8" r="13" fill="#FFE8D9" />
      </g>
    </svg>
  );
}

/**
 * Banner de bienvenida del menú principal: franja verde con el rol del usuario en una etiqueta, el saludo según la
 * hora como título, la pregunta de qué desea hacer, una ilustración de ruta a la derecha y una línea naranja abajo.
 * @param {{ roleLabel: string, greeting: string, question: string }} props
 */
export default function WelcomeBanner({ roleLabel, greeting, question }) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        borderRadius: RADIUS.lg,
        // Línea naranja recta abajo (con borderBottom se curvaba en las esquinas).
        '&::after': { content: '""', position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, bgcolor: 'secondary.main' },
        px: { xs: 3, md: 5 },
        pt: { xs: 3, md: 4 },
        pb: { xs: 4, md: 5 },
        minHeight: { md: 168 },
      }}
    >
      {/* En pantallas angostas la ilustración no cabe sin tapar el texto. */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <RouteIllustration />
      </Box>
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75 }}>
        <Box
          component="span"
          sx={{
            bgcolor: 'secondary.light',
            color: 'secondary.text',
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
            fontSize: FONT.sm,
            fontWeight: 600,
            lineHeight: 1.3,
          }}
        >
          {roleLabel}
        </Box>
        <Typography
          component="h1"
          sx={{ mt: 1, fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: { xs: fontPx(32), md: fontPx(44) }, lineHeight: 1.1, letterSpacing: '-0.5px' }}
        >
          {greeting}
        </Typography>
        <Typography sx={{ fontSize: { xs: FONT.lg, md: fontPx(17) }, color: 'rgba(255,255,255,.85)' }}>{question}</Typography>
      </Box>
    </Box>
  );
}
