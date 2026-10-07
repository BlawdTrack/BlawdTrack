import { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import { useAdminRegistration } from '../hooks/useAdminRegistration';
import { validateAdminForm } from '../utils/adminFormValidation';
import { StatusMessage } from '../components/StatusMessage';
import PageHeader from '../components/PageHeader';
import PageContainer from '../components/PageContainer';
import { LABEL_SX, INPUT_SX } from '../components/formStyles';
import { DOCUMENT_TYPE_OPTIONS, DOCUMENT_PLACEHOLDERS } from '../config/documentTypes';

// On phones the form uses 2 columns; wide fields span both.
const SPAN_2_SX = { gridColumn: { xs: 'span 2', md: 'auto' } };
// Campos con texto largo (correo, contraseña): dos columnas también en escritorio.
const SPAN_2_ALWAYS_SX = { gridColumn: 'span 2' };

const INITIAL_FORM_DATA = {
  documentType: 'CEDULA',
  documentNumber: '',
  nombreCompleto: '',
  numeroTelefono: '',
  correoElectronico: '',
  contrasenaInicial: ''
};

// Visual order of the inputs, used to focus the first one with an error.
const FIELD_ORDER = [
  'nombreCompleto',
  'numeroTelefono',
  'correoElectronico',
  'documentType',
  'documentNumber',
  'contrasenaInicial'
];

// Builds the body expected by POST /api/v1/admins (AdminRegistrationRequest).
function buildAdminPayload(formData) {
  return {
    documentType: formData.documentType,
    documentNumber: formData.documentNumber.trim(),
    nombreCompleto: formData.nombreCompleto.trim(),
    numeroTelefono: formData.numeroTelefono.trim(),
    correoElectronico: formData.correoElectronico.trim(),
    contrasenaInicial: formData.contrasenaInicial
  };
}

export function AdminRegistrationPage() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const {
    isSubmitting,
    isSuccess,
    registeredAdmin,
    fieldErrors,
    globalMessage,
    severity,
    register,
    setValidationErrors,
    setFieldError,
    clearFieldError
  } = useAdminRegistration();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    clearFieldError(name);
  };

  // Validate a text field when the user leaves it, but only once it has content
  // (an empty required field is reported on submit, not while tabbing through).
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value.trim()) return;
    const message = validateAdminForm(formData)[name];
    if (message) setFieldError(name, message);
  };

  const focusFirstError = (errors) => {
    const firstField = FIELD_ORDER.find((name) => errors[name]);
    // Every input has id === field name, so the DOM lookup is enough.
    if (firstField) document.getElementById(firstField)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const clientErrors = validateAdminForm(formData);
    if (Object.keys(clientErrors).length > 0) {
      setValidationErrors(clientErrors);
      focusFirstError(clientErrors);
      return;
    }

    const outcome = await register(buildAdminPayload(formData));
    if (outcome?.ok) {
      setFormData(INITIAL_FORM_DATA);
    } else if (outcome) {
      focusFirstError(outcome.fieldErrors);
    }
  };

  // Props shared by every input: value, change handler, inline error and
  // accessibility wiring (MUI links helperText through aria-describedby).
  const fieldProps = (name) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: Boolean(fieldErrors[name]),
    helperText: fieldErrors[name] || undefined,
    fullWidth: true,
    sx: INPUT_SX
  });

  const renderField = (name, label, extra, span2 = false) => (
    <Box sx={span2 === 'always' ? SPAN_2_ALWAYS_SX : span2 ? SPAN_2_SX : undefined}>
      <Typography variant="caption" component="label" htmlFor={name} sx={LABEL_SX}>
        {label}
      </Typography>
      <TextField {...fieldProps(name)} {...extra} />
    </Box>
  );

  return (
    <PageContainer>
      <PageHeader
        title="Crear administrador"
        description="Registra a un nuevo administrador de ventas. Todos los campos son obligatorios."
      />
      <Paper
        elevation={0}
        sx={{
          borderRadius: '18px',
          border: '1px solid #E4DED7',
          backgroundColor: '#fff',
          boxShadow: '0 12px 30px rgba(26,60,52,.06)',
          p: { xs: 2, sm: 3.5 },
          textAlign: 'left'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 1.5, sm: 3 } }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '9px',
              backgroundColor: '#F1ECE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: '2.5px solid #1A3C34' }} />
          </Box>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600, m: 0, color: '#1A3C34' }}>
            Datos del nuevo administrador
          </Typography>
        </Box>

        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2.5 } }}>
          {isSuccess && (
            <StatusMessage
              severity="success"
              message={`Administrador registrado correctamente. ${registeredAdmin?.correoElectronico || formData.correoElectronico} ya puede iniciar sesión con la contraseña asignada.`}
            />
          )}
          {globalMessage && <StatusMessage severity={severity} message={globalMessage} />}

          <Box
            sx={{
              display: 'grid',
              gap: { xs: '10px 12px', sm: '18px 22px' },
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              alignItems: 'start'
            }}
          >
            {renderField('nombreCompleto', 'NOMBRE COMPLETO', { required: true, placeholder: 'Ej. Ana Lucía Bermúdez' }, true)}
            <Box>
              <Typography variant="caption" component="label" htmlFor="documentType" sx={LABEL_SX}>
                TIPO DE DOCUMENTO
              </Typography>
              <TextField {...fieldProps('documentType')} select required>
                {DOCUMENT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {renderField('documentNumber', 'NÚMERO DE DOCUMENTO', { required: true, placeholder: DOCUMENT_PLACEHOLDERS[formData.documentType] })}
            {renderField('numeroTelefono', 'TELÉFONO', { required: true, type: 'tel', placeholder: '8888-8888' }, true)}
            {renderField('correoElectronico', 'CORREO ELECTRÓNICO', { required: true, type: 'email', placeholder: 'nombre@blawdgourmet.com' }, 'always')}
            {renderField('contrasenaInicial', 'CONTRASEÑA INICIAL', { required: true, type: 'password', placeholder: 'Mínimo 8 caracteres, letras y números' }, 'always')}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', '& button': { width: { xs: '100%', sm: 'auto' } } }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#1A3C34',
                '&:hover': { backgroundColor: '#12322B' },
                textTransform: 'none',
                fontWeight: 600,
                px: 2.75,
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: '10px',
                gap: 1.2,
                boxShadow: 'none'
              }}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={18} color="inherit" />
                  Registrando…
                </>
              ) : (
                <>
                  Registrar administrador
                  <Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF6C0E' }} />
                </>
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </PageContainer>
  );
}

export default AdminRegistrationPage;
