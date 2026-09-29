import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../components/Toast';
import { ROUTES } from '../config/routes';
import { validateAdminForm } from '../utils/adminFormValidation';

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CEDULA', label: 'Cédula' },
  { value: 'DIMEX', label: 'DIMEX' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

const DOCUMENT_PLACEHOLDERS = {
  CEDULA: 'Ej. 1-2345-6789',
  DIMEX: 'Ej. 155812345678',
  PASAPORTE: 'Ej. A12345678',
};

const INITIAL_FORM_DATA = {
  documentType: 'CEDULA',
  documentNumber: '',
  fullName: '',
  phone: '',
  email: '',
  initialPassword: '',
};

const FIELD_ORDER = ['fullName', 'documentType', 'documentNumber', 'email', 'phone', 'initialPassword'];

const LABEL_SX = {
  fontSize: '11.5px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: '#6B6560',
  mb: 0.75,
  display: 'block',
};

const INPUT_SX = {
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    fontSize: '14.5px',
    backgroundColor: '#fff',
    borderColor: '#DCD4CA',
    '& fieldset': {
      borderColor: '#DCD4CA',
      borderWidth: '1.5px',
    },
    '&:hover fieldset': {
      borderColor: '#DCD4CA',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1A3C34',
      boxShadow: 'none',
    },
  },
  '& .MuiOutlinedInput-input': {
    py: 1.4,
    px: 1.75,
    color: '#1F2421',
    '&::placeholder': {
      color: '#B4ADA4',
      opacity: 1,
    },
  },
  '& .MuiFormHelperText-root': {
    m: 0,
    pt: 0.75,
    fontSize: '11.5px',
    color: '#C0392B',
    lineHeight: 1.4,
  },
};

function getTrimmedValues(formData) {
  return {
    documentType: formData.documentType,
    documentNumber: formData.documentNumber.trim(),
    fullName: formData.fullName.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    initialPassword: formData.initialPassword.trim(),
  };
}

export function AdminRegistrationPage({ onSubmit, isSubmitting = false, auditEntries = [] }) {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const navigate = useNavigate();

  const focusFirstError = (errors) => {
    const firstField = FIELD_ORDER.find((name) => errors[name]);
    if (firstField) document.getElementById(firstField)?.focus();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value || !value.trim()) return;

    const nextErrors = validateAdminForm({ ...formData, [name]: value });
    setFieldErrors((prev) => {
      const nextErrorsMap = { ...prev };
      if (nextErrors[name]) {
        nextErrorsMap[name] = nextErrors[name];
      } else {
        delete nextErrorsMap[name];
      }
      return nextErrorsMap;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = validateAdminForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setToastOpen(true);
      focusFirstError(errors);
      return;
    }

    // La integración con la API es T05; aquí solo se entrega el payload ya validado.
    onSubmit?.(getTrimmedValues(formData));
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA);
    setFieldErrors({});
    setToastOpen(false);
    navigate(ROUTES.MAIN_MENU);
  };

  const renderTextField = (name, label, inputProps = {}) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Typography component="label" htmlFor={name} sx={LABEL_SX}>
        {label}
      </Typography>
      <TextField
        id={name}
        fullWidth
        name={name}
        value={formData[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        error={Boolean(fieldErrors[name])}
        helperText={fieldErrors[name] || ' '}
        aria-invalid={Boolean(fieldErrors[name])}
        sx={INPUT_SX}
        {...inputProps}
      />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FAF8F5', px: { xs: 1.5, sm: 3.5 }, py: { xs: 1.5, sm: 3.5 } }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            border:'1px solid #E4DED7',
            borderRadius: '18px',
            p: { xs: '20px 18px 18px', sm: '26px 28px 28px' },
            boxShadow: '0 12px 30px rgba(26,60,52,.06)',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
            textAlign: 'left',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '9px',
                backgroundColor: '#F1ECE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box sx={{ width: 15, height: 15, borderRadius: '4px', border: '2.5px solid #1A3C34', display: 'block' }} />
            </Box>
            <Typography component="h1" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '17px', fontWeight: 600, color: '#1A3C34', m: 0 }}>
              Nuevo administrador de ventas
            </Typography>
          </Box>

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '18px 22px',
              }}
            >
              {renderTextField('fullName', 'Nombre completo', {
                type: 'text',
                placeholder: 'Ej. Rodrigo Castillo Pérez',
              })}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Typography component="label" htmlFor="documentType" sx={LABEL_SX}>
                  Tipo de documento
                </Typography>
                <TextField
                  id="documentType"
                  name="documentType"
                  select
                  fullWidth
                  value={formData.documentType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(fieldErrors.documentType)}
                  helperText={fieldErrors.documentType || ' '}
                  aria-invalid={Boolean(fieldErrors.documentType)}
                  aria-label="Tipo de documento"
                  sx={INPUT_SX}
                  SelectProps={{ inputProps: { 'aria-label': 'Tipo de documento' } }}
                >
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {renderTextField('documentNumber', 'Número de documento', {
                type: 'text',
                placeholder: DOCUMENT_PLACEHOLDERS[formData.documentType],
              })}

              {renderTextField('email', 'Correo electrónico', {
                type: 'email',
                placeholder: 'nombre@blawdgourmet.com',
              })}

              {renderTextField('phone', 'Teléfono', {
                type: 'tel',
                placeholder: '8888-8888',
              })}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Typography component="label" htmlFor="initialPassword" sx={LABEL_SX}>
                  Contraseña inicial
                </Typography>
                <TextField
                  id="initialPassword"
                  name="initialPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.initialPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={Boolean(fieldErrors.initialPassword)}
                  helperText={fieldErrors.initialPassword || ' '}
                  aria-invalid={Boolean(fieldErrors.initialPassword)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  fullWidth
                  sx={INPUT_SX}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            sx={{ color: '#1A3C34' }}
                            type="button"
                          >
                            {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap', '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } } }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  backgroundColor: '#1A3C34',
                  color: '#fff',
                  borderRadius: '10px',
                  px: '22px',
                  py: '14px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: '#12322B', boxShadow: 'none' },
                  gap: '9px',
                }}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={18} color="inherit" />
                    Creando…
                  </>
                ) : (
                  <>
                    Crear administrador
                    <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF6C0E', display: 'inline-block' }} />
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outlined"
                onClick={handleCancel}
                sx={{
                  backgroundColor: '#fff',
                  color: '#1A3C34',
                  border: '1.5px solid #DCD4CA',
                  borderRadius: '10px',
                  px: '20px',
                  py: '14px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                }}
              >
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: '#fff',
            border: '1px solid #E4DED7',
            borderRadius: '18px',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderBottom: '1px solid #E4DED7', px: '24px', py: '16px' }}>
            <Typography component="h2" sx={{ fontFamily: 'Poppins, sans-serif', fontSize: '15px', fontWeight: 600, color: '#1A3C34', m: 0 }}>
              Historial de auditoría
            </Typography>
          </Box>

          {auditEntries.length === 0 ? (
            <Box sx={{ py: 3, px: 2, textAlign: 'center', color: '#666', fontSize: '14px' }}>
              No hay registros de auditoría recientes.
            </Box>
          ) : (
            auditEntries.map((entry) => (
              <Box key={entry.id} sx={{ px: '24px', py: '14px', borderTop: '1px solid #EFEAE4', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'baseline' }}>
                <Box sx={{ fontSize: '11.5px', fontWeight: 600, color: '#9E968D', width: '150px' }}>{entry.when}</Box>
                <Box sx={{ fontSize: '11.5px', fontWeight: 700, color: '#1F5233', backgroundColor: '#E9F3EC', borderRadius: '20px', px: '9px', py: '3px' }}>
                  {entry.action}
                </Box>
                <Box sx={{ fontSize: '13px', color: '#1F2421', flex: '1 1 180px' }}>{entry.target}</Box>
                <Box sx={{ fontSize: '11.5px', color: '#6B6560' }}>{entry.by}</Box>
              </Box>
            ))
          )}
        </Paper>
      </Box>

      <Toast open={toastOpen} message="Ningún campo puede quedar vacío." severity="error" onClose={() => setToastOpen(false)} autoHideDuration={4000} />
    </Box>
  );
}

export default AdminRegistrationPage;
