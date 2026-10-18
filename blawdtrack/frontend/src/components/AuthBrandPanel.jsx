import { Box, Typography } from '@mui/material';
import BrandLogo from './BrandLogo';
import loginPanel from '../assets/login-panel.svg';
import { FONT, rem, fontPx } from '../theme';

/**
 * Panel verde de las pantallas de acceso (inicio de sesión y recuperación de contraseña): el arte de la ruta como
 * fondo y, encima, el logo y el mensaje de la pantalla. Solo se ve en escritorio, para no quitarle espacio al
 * formulario en el teléfono.
 * @param {{ title: import('react').ReactNode, subtitle: string, sx?: object }} props `title` es el titular (la
 *   parte en naranja va en un `span` con `color: 'secondary.main'`); `sx` ajusta el ancho según el marco.
 */
export default function AuthBrandPanel({ title, subtitle, sx }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: 'primary.main',
        // Entre comillas: Vite incrusta el SVG (pesa poco) como data URI, que trae paréntesis y rompería la regla.
        backgroundImage: `url("${loginPanel}")`,
        // El arte ocupa siempre todo el alto (con `cover` se recortaba arriba y abajo en ventanas más anchas y se
        // perdía la punta del pin y las cajas) y se ancla a la derecha; lo que sobra a la izquierda es el mismo verde.
        backgroundSize: 'auto 100%',
        backgroundPosition: 'right center',
        backgroundRepeat: 'no-repeat',
        color: 'primary.contrastText',
        p: 6,
        borderRight: '4px solid',
        borderColor: 'secondary.main',
        ...sx,
      }}
    >
      <BrandLogo variant="horizontalShort" onDark width={170} />

      {/* El mensaje ocupa el espacio bajo el logo y queda centrado en él. */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography
          component="p"
          sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: fontPx(48), lineHeight: 1.1, letterSpacing: '-0.5px', mb: 2.5, color: 'common.white' }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: FONT.xl, color: 'rgba(255,255,255,0.75)', maxWidth: rem(360), lineHeight: 1.5 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
