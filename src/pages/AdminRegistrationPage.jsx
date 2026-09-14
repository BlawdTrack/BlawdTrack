import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography
} from '@mui/material';

export default function AdminRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    idCard: '',
    email: '',
    phoneNumber: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es obligatorio';
    }

    if (!formData.idCard.trim()) {
      newErrors.idCard = 'La cédula es obligatoria';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'El teléfono es obligatorio';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña inicial es obligatoria';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Administrator data submitted:', formData);
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff',
      borderRadius: '10px',

      '& fieldset': {
        borderColor: '#DCD4CA'
      },

      '&:hover fieldset': {
        borderColor: '#BFB6AC'
      },

      '&.Mui-focused fieldset': {
        borderColor: '#1A3C34'
      }
    },

    '& .MuiInputBase-input': {
      padding: '13px 15px',
      fontSize: '15px'
    }
  };

  const labelStyles = {
    fontSize: '12px',
    fontWeight: 700,
    color: '#6B6560',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    mb: 0.7
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F7F6F3',
        p: {
          xs: 0,
          md: 2
        }
      }}
    >
      <Box
        sx={{
          maxWidth: '1440px',
          minHeight: {
            xs: '100vh',
            md: 'calc(100vh - 32px)'
          },
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: {
            xs: 0,
            md: '16px'
          },
          overflow: 'hidden',
          boxShadow: {
            xs: 'none',
            md: '0 10px 35px rgba(0,0,0,0.08)'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            backgroundColor: '#1A3C34',
            color: '#ffffff',
            minHeight: {
              xs: '180px',
              md: '210px'
            },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            borderTop: '4px solid #FF6C0E'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2
            }}
          >
            <Box
              sx={{
                width: {
                  xs: '44px',
                  md: '50px'
                },
                height: {
                  xs: '44px',
                  md: '50px'
                },
                backgroundColor: '#ffffff',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                mb: 0.8
              }}
            >
              <Box
                component="img"
                src="/Logo.png"
                alt="Logo BlawdTrack"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </Box>

            <Typography
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: {
                  xs: '15px',
                  md: '17px'
                },
                lineHeight: 1
              }}
            >
              BlawdTrack
            </Typography>
          </Box>

          {/* Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2
            }}
          >
            {/* Administrator icon */}
            <Box
              sx={{
                position: 'relative',
                width: {
                  xs: '28px',
                  md: '32px'
                },
                height: {
                  xs: '28px',
                  md: '32px'
                },
                flexShrink: 0,
                overflow: 'visible'
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>

              {/* Orange plus detail */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-4px',
                  width: {
                    xs: '12px',
                    md: '13px'
                  },
                  height: {
                    xs: '12px',
                    md: '13px'
                  },
                  backgroundColor: '#FF6C0E',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: {
                    xs: '9px',
                    md: '10px'
                  },
                  fontWeight: 900,
                  lineHeight: 1,
                  border: '1px solid #1A3C34'
                }}
              >
                +
              </Box>
            </Box>

            <Typography
              component="h1"
              sx={{
                color: '#ffffff',
                fontSize: {
                  xs: '20px',
                  md: '27px'
                },
                fontWeight: 800,
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              Registro de administrador
            </Typography>
          </Box>

          {/* Subtitle */}
          <Typography
            sx={{
              color: '#ffffff',
              mt: 0.8,
              fontSize: {
                xs: '12px',
                md: '13px'
              },
              opacity: 0.95,
              textAlign: 'center'
            }}
          >
            Crea una nueva cuenta con acceso administrativo.
          </Typography>
        </Box>

        {/* Main content */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            px: {
              xs: 2.2,
              md: 4
            },
            py: {
              xs: 2.5,
              md: 5.5
            }
          }}
        >
          {/* Registration form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              width: '100%',
              maxWidth: '700px',
              backgroundColor: '#F1ECE7',
              borderRadius: '16px',
              p: {
                xs: 2.2,
                sm: 3,
                md: 4
              }
            }}
          >
            {/* Form fields grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr'
                },
                columnGap: '28px',
                rowGap: '18px'
              }}
            >
              {/* Full name */}
              <Box>
                <Typography sx={labelStyles}>
                  Nombre completo
                </Typography>

                <TextField
                  fullWidth
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ej. Carlos Andrés Mora"
                  error={Boolean(errors.fullName)}
                  helperText={errors.fullName}
                  sx={inputStyles}
                />
              </Box>

              {/* ID card */}
              <Box>
                <Typography sx={labelStyles}>
                  Cédula
                </Typography>

                <TextField
                  fullWidth
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleChange}
                  placeholder="1-2345-6789"
                  error={Boolean(errors.idCard)}
                  helperText={errors.idCard}
                  sx={inputStyles}
                />
              </Box>

              {/* Email */}
              <Box>
                <Typography sx={labelStyles}>
                  Correo electrónico
                </Typography>

                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nombre@blawdgourmet.com"
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  sx={inputStyles}
                />
              </Box>

              {/* Phone number */}
              <Box>
                <Typography sx={labelStyles}>
                  Teléfono
                </Typography>

                <TextField
                  fullWidth
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="8888-8888"
                  error={Boolean(errors.phoneNumber)}
                  helperText={errors.phoneNumber}
                  sx={inputStyles}
                />
              </Box>

              {/* Initial password */}
              <Box>
                <Typography sx={labelStyles}>
                  Contraseña inicial
                </Typography>

                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  sx={inputStyles}
                />
              </Box>
            </Box>

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disableElevation
              sx={{
                mt: 3,
                backgroundColor: '#1A3C34',
                color: '#ffffff',
                borderRadius: '10px',
                py: 1.5,
                textTransform: 'none',
                fontSize: '15px',
                fontWeight: 700,

                '&:hover': {
                  backgroundColor: '#143029'
                }
              }}
            >
              Registrar administrador

              <Box
                component="span"
                sx={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#FF6C0E',
                  ml: 1
                }}
              />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}