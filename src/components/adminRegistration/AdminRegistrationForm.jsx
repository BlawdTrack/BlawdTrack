import { Box, Button, TextField, Typography } from '@mui/material';

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

const fields = [
  {
    name: 'fullName',
    label: 'Nombre completo',
    placeholder: 'Ej. Carlos Andrés Mora',
    type: 'text',
    autoComplete: 'name'
  },
  {
    name: 'idCard',
    label: 'Cédula',
    placeholder: '1-2345-6789',
    type: 'text',
    autoComplete: 'off'
  },
  {
    name: 'email',
    label: 'Correo electrónico',
    placeholder: 'nombre@blawdgourmet.com',
    type: 'email',
    autoComplete: 'email'
  },
  {
    name: 'phoneNumber',
    label: 'Teléfono',
    placeholder: '8888-8888',
    type: 'tel',
    autoComplete: 'tel'
  },
  {
    name: 'password',
    label: 'Contraseña inicial',
    placeholder: '••••••••',
    type: 'password',
    autoComplete: 'new-password'
  }
];

function AdminField({
  name,
  label,
  placeholder,
  type,
  autoComplete,
  value,
  error,
  onChange
}) {
  const id = `admin-${name}`;

  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          ...labelStyles,
          display: 'block'
        }}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        fullWidth
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error}
        sx={inputStyles}
      />
    </Box>
  );
}

export default function AdminRegistrationForm({
  formData,
  errors,
  message,
  onChange,
  onSubmit
}) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
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
      {/* Campos del formulario */}
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
        {fields.map((field) => (
          <AdminField
            key={field.name}
            {...field}
            value={formData[field.name]}
            error={errors[field.name]}
            onChange={onChange}
          />
        ))}
      </Box>

      {/* El frontend aún no registra administradores */}
      {message && (
        <Typography
          role="status"
          sx={{
            color: '#1A3C34',
            fontSize: '13px',
            mt: 2
          }}
        >
          {message}
        </Typography>
      )}

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
  );
}