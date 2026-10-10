import { useAdminRegistration } from '../hooks/useAdminRegistration';
import { useRegistrationForm } from '../hooks/useRegistrationForm';
import { validateAdminForm } from '../utils/adminFormValidation';
import FormField from '../components/FormField';
import DocumentFields from '../components/DocumentFields';
import RegistrationFormPage from '../components/RegistrationFormPage';
import { FULL_ROW_SX } from '../components/formStyles';
import { ROUTES } from '../config/routes';

const INITIAL_FORM_DATA = {
  documentType: 'CEDULA',
  documentNumber: '',
  nombreCompleto: '',
  numeroTelefono: '',
  correoElectronico: ''
};

// Visual order of the inputs, used to focus the first one with an error.
const FIELD_ORDER = [
  'nombreCompleto',
  'correoElectronico',
  'numeroTelefono',
  'documentType',
  'documentNumber'
];

// Builds the body expected by POST /api/v1/admins (AdminRegistrationRequest).
function buildAdminPayload(formData) {
  return {
    documentType: formData.documentType,
    documentNumber: formData.documentNumber.trim(),
    nombreCompleto: formData.nombreCompleto.trim(),
    numeroTelefono: formData.numeroTelefono.trim(),
    correoElectronico: formData.correoElectronico.trim()
  };
}

const buildAdminNotice = (outcome, payload) =>
  `Administrador creado correctamente. Se envió un correo a ${payload.correoElectronico} con la contraseña temporal.`;

/**
 * Pantalla "Crear administrador" (HU-006), exclusiva del Super Usuario. Valida el formulario en el cliente
 * (`validateAdminForm`), arma el cuerpo de `POST /api/v1/admins` y muestra los errores del backend junto a
 * cada campo. La contraseña temporal la genera y envía por correo el backend. Al crear el administrador vuelve
 * al menú de gestión de administradores con un aviso de éxito.
 */
export function AdminRegistrationPage() {
  const registration = useAdminRegistration();
  const { formData, form, handleSubmit, fieldProps } = useRegistrationForm({
    initialData: INITIAL_FORM_DATA,
    validate: validateAdminForm,
    fieldOrder: FIELD_ORDER,
    discardTo: ROUTES.MODULE_ADMINS,
    registration,
    buildPayload: buildAdminPayload,
    buildNotice: buildAdminNotice
  });

  return (
    <RegistrationFormPage
      title="Crear administrador"
      description="Registra a un nuevo administrador de ventas. Recibirá por correo una contraseña temporal para ingresar."
      onSubmit={handleSubmit}
      form={form}
      isSubmitting={registration.isSubmitting}
      submitLabel="Registrar administrador"
      submittingLabel="Registrando…"
      globalMessage={registration.globalMessage}
      severity={registration.severity}
    >
      <FormField {...fieldProps('nombreCompleto')} label="Nombre completo" required placeholder="Ej. Ana Lucía Bermúdez" sx={FULL_ROW_SX} />
      <FormField {...fieldProps('correoElectronico')} label="Correo electrónico" required type="email" placeholder="nombre@blawdgourmet.com" />
      <FormField {...fieldProps('numeroTelefono')} label="Teléfono" required type="tel" placeholder="8888-8888" />
      <DocumentFields field={fieldProps} documentType={formData.documentType} />
    </RegistrationFormPage>
  );
}

export default AdminRegistrationPage;
