
import { Box, Button, TextField, Typography } from '@mui/material';
import { useAdminRegistrationForm } from '../../hooks/useAdminRegistrationForm.js';

const fields = [
  {
    name: 'fullName',
    label: 'NOMBRE COMPLETO',
    placeholder: 'Ej. Rodrigo Castillo Pérez',
    type: 'text',
    autoComplete: 'name'
  },
  {
    name: 'idCard',
    label: 'CÉDULA',
    placeholder: '1-2345-6789',
    type: 'text',
    autoComplete: 'off'
  },
  {
    name: 'email',
    label: 'CORREO ELECTRÓNICO',
    placeholder: 'nombre@blawdgourmet.com',
    type: 'email',
    autoComplete: 'email'
  },
  {
    name: 'phoneNumber',
    label: 'TELÉFONO',
    placeholder: '8888-8888',
    type: 'tel',
    autoComplete: 'tel'
  },
  {
    name: 'password',
    label: 'CONTRASEÑA INICIAL',
    placeholder: '••••••••',
    type: 'password',
    autoComplete: 'new-password'
  }
];

function TitleIcon() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: 34,
        height: 34,
        borderRadius: '10px',
        bgcolor: 'background.default',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 24 24"
        sx={{
          width: 18,
          height: 18,
          fill: 'none',
          color: 'primary.main'
        }}
      >
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z"
          fill="currentColor"
        />
        <path
          d="M4 20c0-3 3.5-5 8-5s8 2 8 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Box>
    </Box>
  );
}

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
        sx={{
          display: 'block',
          mb: 0.8,
          fontSize: '12px',
          fontWeight: 700,
          color: 'text.secondary',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          textAlign: 'left'
        }}
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
        slotProps={{
          formHelperText: {
            sx: {
              ml: 0,
              mt: 0.8,
              textAlign: 'left'
            }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            bgcolor: 'background.paper',

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
            px: '14px',
            py: '13px',
            fontSize: '15px',
            textAlign: 'left'
          }
        }}
      />
    </Box>
  );
}

export default function AdminRegistrationCard() {
  const {
    formData,
    errors,
    message,
    handleChange,
    handleSubmit
  } = useAdminRegistrationForm();

  return (
    <Box
      component="section"
      aria-labelledby="admin-registration-title"
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '20px',
        textAlign: 'left',
        p: {
          xs: 2,
          md: 3.5
        }
      }}
    >
      {/* TÍTULO DE LA TARJETA */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 1.5,
          mb: 3
        }}
      >
        <TitleIcon />

        <Typography
          id="admin-registration-title"
          component="h2"
          sx={{
            fontSize: {
              xs: '18px',
              md: '20px'
            },
            fontWeight: 700,
            color: 'text.primary',
            textAlign: 'left'
          }}
        >
          Nuevo administrador de ventas
        </Typography>
      </Box>

      {/* FORMULARIO */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          width: '100%',
          textAlign: 'left'
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))'
            },
            columnGap: 2.2,
            rowGap: 2.2
          }}
        >
          {/* Primera fila: cuatro campos */}
          {fields.slice(0, 4).map((field) => (
            <AdminField
              key={field.name}
              {...field}
              value={formData[field.name]}
              error={errors[field.name]}
              onChange={handleChange}
            />
          ))}

          {/* Segunda fila: contraseña inicial */}
          <AdminField
            {...fields[4]}
            value={formData.password}
            error={errors.password}
            onChange={handleChange}
          />
        </Box>

        {/* El formulario se valida, pero aún no registra en el backend */}
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

        {/* BOTÓN DE REGISTRO */}
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'flex-start'
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              px: 3,
              py: 1.4,
              width: 'auto',
              maxWidth: '100%',
              borderRadius: '12px',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontSize: '15px',
              fontWeight: 700,
              textTransform: 'none',

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
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                ml: 1.2,
                flexShrink: 0
              }}
            />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}