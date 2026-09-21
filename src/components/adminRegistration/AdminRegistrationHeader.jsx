import { Box, Typography } from '@mui/material';

export default function AdminRegistrationHeader() {
  return (
    <Box
      component="header"
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
      {/* Logo y nombre de BlawdTrack */}
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
            width: { xs: '44px', md: '50px' },
            height: { xs: '44px', md: '50px' },
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
            alt="Logo de BlawdTrack"
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

      {/* Ícono y título */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.2
        }}
      >
        <Box
          aria-hidden="true"
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
            flexShrink: 0
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
              fontSize: '10px',
              fontWeight: 900,
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
  );
}