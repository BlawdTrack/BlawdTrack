import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Link,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { StatusMessage } from '../components/StatusMessage';
import PasswordField from '../components/PasswordField';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { LINK_BUTTON_SX } from '../components/formStyles';
import { CARD_PATTERN_SX, RADIUS, FONT, rem, fontPx } from '../theme';
import BrandLogo from '../components/BrandLogo';
import loginPanel from '../assets/login-panel.svg';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Etiqueta de los campos: en minúsculas, en negrita y en verde oscuro, como en el diseño.
const FIELD_LABEL_SX = { fontSize: FONT.md, fontWeight: 700, color: 'primary.main' };
// Campos altos (56 px) y de esquinas redondeadas, más cómodos de leer y de tocar.
const FIELD_SX = { '& .MuiOutlinedInput-root': { minHeight: 56, borderRadius: rem(14), fontSize: FONT.lg } };

function validateForm(data) {
  const errors = { email: '', password: '' };

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio.';
  } else if (!EMAIL_REGEX.test(data.email.trim())) {
    errors.email = 'Ingresa un correo electrónico con un formato válido.';
  }

  if (!data.password) {
    errors.password = 'La contraseña es obligatoria.';
  }

  return errors;
}

/**
 * Pantalla de inicio de sesión (HU-001). Valida correo y contraseña en el cliente y, si son válidos,
 * llama a `login` del contexto de autenticación.
 * @param {{ onLoginSuccess?: Function, onSubmitAttempt?: Function, onForgotPassword?: Function }} props
 *   `onLoginSuccess` se ejecuta con la respuesta del login; `onForgotPassword` abre la recuperación.
 */
export function LoginPage({ onLoginSuccess, onSubmitAttempt, onForgotPassword }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const { login, loading, error, resetError } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
    if (error) resetError();
    if (fieldErrors[name]) {
      setFieldErrors((previousErrors) => ({ ...previousErrors, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm(formData);
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      // Se detiene aquí: no se llama a login() ni se dispara onSubmitAttempt,
      // así que nunca se envía una petición al backend con datos incompletos
      // o un correo con formato inválido (T04).
      return;
    }

    onSubmitAttempt?.();
    try {
      const response = await login(formData.email, formData.password);
      onLoginSuccess?.(response);
    } catch {
      // El mensaje de error ya queda reflejado por el AuthContext.
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Panel de marca: solo en escritorio, para no quitarle espacio al formulario en móvil. El arte (anillos, ruta,
          cajas y pin) es la imagen de fondo; encima van el logo y el mensaje. */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 42%',
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
        }}
      >
        <BrandLogo variant="horizontalShort" onDark width={170} />

        {/* El mensaje ocupa el espacio bajo el logo y queda centrado en él. */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography
            component="p"
            sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: fontPx(48), lineHeight: 1.1, letterSpacing: '-0.5px', mb: 2.5, color: 'common.white' }}
          >
            Cada entrega,
            <br />
            siempre <Box component="span" sx={{ color: 'secondary.main' }}>a la vista.</Box>
          </Typography>
          <Typography sx={{ fontSize: FONT.xl, color: 'rgba(255,255,255,0.75)', maxWidth: rem(360), lineHeight: 1.5 }}>
            Gestiona mensajeros, rutas y paquetes de Blawd Gourmet desde un solo lugar.
          </Typography>
        </Box>

      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: 4,
        }}
      >
        {/* En móvil el panel de marca no se ve, así que la marca va sobre el formulario. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
          <BrandLogo variant="stacked" width={104} />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            width: '100%',
            maxWidth: rem(520),
            ...CARD_PATTERN_SX,
            border: '1px solid', borderColor: 'neutral.border',
            borderRadius: RADIUS.lg,
            p: { xs: 3, sm: 6 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="h1"
              sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: fontPx(36), lineHeight: 1.15, color: 'primary.main' }}
            >
              Iniciar sesión
            </Typography>
            <Typography sx={{ fontSize: FONT.lg, color: 'text.secondary', mt: 1.5, lineHeight: 1.5 }}>
              Ingresa con tu correo y contraseña. El sistema te llevará al panel de tu rol.
            </Typography>
          </Box>

          {error && <StatusMessage severity={error.severity} message={error.message} />}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="label" htmlFor="login-email" sx={FIELD_LABEL_SX}>
              Correo electrónico
            </Typography>
            <TextField
              fullWidth
              required
              id="login-email"
              name="email"
              type="email"
              placeholder="nombre@blawdgourmet.com"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
              sx={FIELD_SX}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography component="label" htmlFor="login-password" sx={FIELD_LABEL_SX}>
              Contraseña
            </Typography>
            <PasswordField
              fullWidth
              required
              id="login-password"
              name="password"
              placeholder="Tu contraseña"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              sx={FIELD_SX}
            />
            <Link
              component="button"
              type="button"
              onClick={() => onForgotPassword?.()}
              underline="hover"
              sx={{ ...LINK_BUTTON_SX, alignSelf: 'center', mt: 0.5, color: 'secondary.text', fontWeight: 700, fontSize: FONT.md }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            endIcon={loading ? null : <ArrowForwardOutlinedIcon />}
            sx={{ fontWeight: 700, fontSize: FONT.lg, minHeight: 56, borderRadius: rem(16) }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'inherit' }} /> : 'Iniciar sesión'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <LockOutlinedIcon sx={{ fontSize: FONT.lg, color: 'text.secondary', mt: '0.2rem', flexShrink: 0 }} />
            <Typography sx={{ fontSize: FONT.md, color: 'text.secondary', lineHeight: 1.45 }}>
              Requiere conexión a internet. Tus contraseñas se guardan encriptadas.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
