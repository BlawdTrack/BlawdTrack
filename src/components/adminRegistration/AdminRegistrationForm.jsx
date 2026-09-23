
import { Box, Button, TextField, Typography } from '@mui/material';

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
    borderRadius: '10px',

    '& fieldset': {
      borderColor: 'divider'
    },

    '&:hover fieldset': {
      borderColor: 'text.secondary'
    },

    '&.Mui-focused fieldset': {
      borderColor: 'primary.main'
    }
  },

  '& .MuiInputBase-input': {
    padding: '11px 14px',
    fontSize: '14px'
  },

  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    textAlign: 'left'
  }
};

const labelStyles = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.4px',
  mb: 0.7,
  textAlign: 'left'
};

const fields = [
  {
    name: 'fullName',
    label: 'Nombre completo',
    placeholder: 'Ej. Rodrigo Castillo Pérez',
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
    <Box sx={{ minWidth: 0, textAlign: 'left' }}>
      <Typography
        component="label"
        htmlFor={id}
        sx={labelStyles}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error || ''}
        fullWidth
        size="small"
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
        textAlign: 'left'
      }}
    >
      {/* Cuatro campos en escritorio; distribución adaptable en móvil */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))'
          },
          columnGap: 2.5,
          rowGap: 2.2
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

      {/* Informa sobre la validación; no afirma que se creó una cuenta */}
      {message && (
        <Typography
          role="status"
          sx={{
            mt: 2,
            color: 'primary.main',
            fontSize: '13px',
            textAlign: 'left'
          }}
        >
          {message}
        </Typography>
      )}

      <Button
        type="submit"
        variant="contained"
        disableElevation
        sx={{
          mt: 2.8,
          px: 2.7,
          minHeight: 46,
          width: 'auto',
          maxWidth: '100%',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '10px',
          textTransform: 'none',
          fontSize: '14px',
          fontWeight: 700,

          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
      >
        Crear administrador

        <Box
          component="span"
          aria-hidden="true"
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: 'secondary.main',
            ml: 1.2,
            flexShrink: 0
          }}
        />
      </Button>
    </Box>
  );
}