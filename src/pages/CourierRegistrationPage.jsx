import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment
} from '@mui/material';

// Custom badge icon for the header card
function BadgeCustomIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="#ff6b00"
      style={{ marginBottom: '8px' }}
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z" />
    </svg>
  );
}

// Custom user add icon for the submit button
function PersonAddCustomIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ marginRight: '8px' }}
    >
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function CourierRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    idCard: '',
    schedule: '',
    maxLoadCapacityKg: ''
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Courier data submitted:', formData);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {/* Header section */}
        <Box
          sx={{
            backgroundColor: '#1b3e32',
            color: '#ffffff',
            p: 3,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <BadgeCustomIcon />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Registro de Mensajero
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Ingrese la información requerida para dar de alta al mensajero en BlawdTrack
          </Typography>
        </Box>

        {/* Registration Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5
          }}
        >
          {/* Row 1: Full Name and Phone Number */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              required
              label="Nombre Completo"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Número de Teléfono"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </Box>

          {/* Row 2: Email and Password */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              required
              label="Correo Electrónico"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Contraseña Inicial"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Box>

          {/* Row 3: ID Card and Schedule */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              fullWidth
              required
              label="Cédula / Identificación"
              name="idCard"
              value={formData.idCard}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              label="Horario"
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
            />
          </Box>

          {/* Row 4: Maximum Load Capacity */}
          <TextField
            fullWidth
            required
            label="Capacidad máxima de carga por paquete"
            name="maxLoadCapacityKg"
            type="number"
            value={formData.maxLoadCapacityKg}
            onChange={handleChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 'bold',
              backgroundColor: '#1b3e32',
              '&:hover': {
                backgroundColor: '#142f26'
              },
              textTransform: 'none',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PersonAddCustomIcon />
            Registrar Mensajero
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

// Exports for compatibility with default and named imports
export { CourierRegistrationPage as RegistroMensajeroPage };
export default CourierRegistrationPage;