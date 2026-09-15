import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';

function NewPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const token = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('token');
  }, []);

  const hasMinimumLength = formData.newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(formData.newPassword);
  const hasNumber = /\d/.test(formData.newPassword);

  const passwordsMatch =
    formData.confirmPassword.length > 0 &&
    formData.newPassword === formData.confirmPassword;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!token) {
      newErrors.token =
        'No se encontró el token de restablecimiento.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword =
        'La nueva contraseña es obligatoria.';
    } else if (
      !hasMinimumLength ||
      !hasLetter ||
      !hasNumber
    ) {
      newErrors.newPassword =
        'La contraseña no cumple con los requisitos de seguridad.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        'Debe confirmar la nueva contraseña.';
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Las contraseñas no coinciden.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ready for backend integration.
    alert('Formulario validado correctamente.');
  };

  const handleCancel = () => {
    window.history.back();
  };

  const requirementStyle = (isValid) => ({
    fontSize: '13px',
    fontWeight: 500,
    color: isValid ? '#1A6B4F' : '#77716C'
  });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F7F6F3',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1A3C34',
          borderTop: '5px solid #FF6C0E',
          color: '#FFFFFF',
          py: {
            xs: 3,
            md: 4
          },
          px: 2,
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            width: 55,
            height: 55,
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            mx: 'auto',
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <Box
            component="img"
            src="/Logo.png"
            alt="BlawdTrack"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>

        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '17px',
            mb: 2
          }}
        >
          BlawdTrack
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30
            }}
          >
            <svg
              viewBox="0 0 24 24"
              width="100%"
              height="100%"
              fill="white"
            >
              <path d="M12 1a5 5 0 0 0-5 5v3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 0 1 6 0v3H9zm3 4a2 2 0 0 1 1 3.73V19h-2v-2.27A2 2 0 0 1 12 13z" />
            </svg>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: {
                xs: '23px',
                md: '28px'
              },
              fontWeight: 800
            }}
          >
            Nueva contraseña
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 1,
            fontSize: '13px',
            opacity: 0.9
          }}
        >
          Crea una nueva contraseña segura para continuar.
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: 2,
          py: {
            xs: 3,
            md: 5
          }
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            maxWidth: '550px',
            backgroundColor: '#F1ECE7',
            borderRadius: '16px',
            p: {
              xs: 2.5,
              sm: 4
            }
          }}
        >
          {errors.token && (
            <Box
              sx={{
                backgroundColor: '#FDECEA',
                border: '1px solid #F4B7B2',
                borderRadius: '9px',
                p: 1.5,
                mb: 2.5
              }}
            >
              <Typography
                sx={{
                  color: '#A93226',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {errors.token}
              </Typography>
            </Box>
          )}

          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#625D58',
              mb: 0.7
            }}
          >
            NUEVA CONTRASEÑA
          </Typography>

          <TextField
            fullWidth
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="••••••••"
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: '10px'
              }
            }}
          />

          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#625D58',
              mb: 0.7
            }}
          >
            CONFIRMAR CONTRASEÑA
          </Typography>

          <TextField
            fullWidth
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            sx={{
              mb: 2.5,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#FFFFFF',
                borderRadius: '10px'
              }
            }}
          />

          <Box
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #DED7D0',
              borderRadius: '10px',
              p: 2,
              mb: 3
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#625D58',
                mb: 1.2
              }}
            >
              REQUISITOS DE SEGURIDAD
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.7
              }}
            >
              <Typography sx={requirementStyle(hasMinimumLength)}>
                {hasMinimumLength ? '✓' : '○'} Mínimo 8 caracteres
              </Typography>

              <Typography sx={requirementStyle(hasLetter)}>
                {hasLetter ? '✓' : '○'} Al menos una letra
              </Typography>

              <Typography sx={requirementStyle(hasNumber)}>
                {hasNumber ? '✓' : '○'} Al menos un número
              </Typography>

              <Typography sx={requirementStyle(passwordsMatch)}>
                {passwordsMatch ? '✓' : '○'} Las contraseñas coinciden
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: {
                xs: 'column-reverse',
                sm: 'row'
              },
              gap: 1.5
            }}
          >
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleCancel}
              sx={{
                borderColor: '#1A3C34',
                color: '#1A3C34',
                borderRadius: '10px',
                py: 1.3,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#1A3C34',
                  backgroundColor: 'rgba(26, 60, 52, 0.05)'
                }
              }}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disableElevation
              sx={{
                backgroundColor: '#1A3C34',
                borderRadius: '10px',
                py: 1.3,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#143029'
                }
              }}
            >
              Cambiar contraseña
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default NewPasswordPage;
