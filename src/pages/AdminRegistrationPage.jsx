
import { Box, Paper } from '@mui/material';

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
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="admin-registration-title"
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        p: { xs: 2, sm: 3, md: 3.5 },
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        textAlign: 'left'
      }}
    >
      <AdminRegistrationHeader />

      <Box sx={{ mt: 3 }}>
        <AdminRegistrationForm
          formData={formData}
          errors={errors}
          message={message}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </Box>
    </Paper>
  );
}