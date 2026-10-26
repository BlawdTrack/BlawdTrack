import { useResourceRegistration } from './useResourceRegistration';
import { registerAdministrator } from '../services/AdminService';
import { normalizeAdminError } from '../utils/adminErrors';

/**
 * Manages the admin registration request (T05 / HU-006) and exposes its
 * outcome the same way useCourier exposes courier registration.
 */
export function useAdminRegistration() {
  const {
    isSubmitting,
    isSuccess,
    successData: registeredAdmin,
    fieldErrors,
    globalMessage,
    severity,
    register,
    setValidationErrors,
    setFieldError,
    clearFieldError,
  } = useResourceRegistration(registerAdministrator, normalizeAdminError);

  return {
    isSubmitting,
    isSuccess,
    registeredAdmin,
    fieldErrors,
    globalMessage,
    severity,
    register,
    setValidationErrors,
    setFieldError,
    clearFieldError,
  };
}

export default useAdminRegistration;
