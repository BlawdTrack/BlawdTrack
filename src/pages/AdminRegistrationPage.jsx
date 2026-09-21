import { Box } from '@mui/material';

import AdminRegistrationHeader from '../components/adminRegistration/AdminRegistrationHeader.jsx';
import AdminRegistrationForm from '../components/adminRegistration/AdminRegistrationForm.jsx';
import { useAdminRegistrationForm } from '../hooks/useAdminRegistrationForm.js';

export default function AdminRegistrationPage() {
  const {
    formData,
    errors,
    message,
    handleChange,
    handleSubmit
  } = useAdminRegistrationForm();

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
        <AdminRegistrationHeader />

        <Box
          component="main"
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
          <AdminRegistrationForm
            formData={formData}
            errors={errors}
            message={message}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </Box>
      </Box>
    </Box>
  );
}