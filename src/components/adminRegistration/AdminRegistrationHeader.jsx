
import { Box, Typography } from '@mui/material';

export default function AdminRegistrationHeader() {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1.5,
        textAlign: 'left'
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 34,
          height: 34,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          borderRadius: '9px'
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            width: 23,
            height: 23,
            fill: 'none',
            stroke: 'primary.main',
            strokeWidth: 1.8
          }}
        >
          <rect x="4" y="4" width="16" height="16" rx="3" />
        </Box>
      </Box>

      <Typography
        id="admin-registration-title"
        component="h2"
        sx={{
          color: 'text.primary',
          fontSize: { xs: '16px', sm: '18px' },
          fontWeight: 700,
          lineHeight: 1.3,
          textAlign: 'left'
        }}
      >
        Nuevo administrador de ventas
      </Typography>
    </Box>
  );
}