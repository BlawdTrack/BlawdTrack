import { useRef, useState } from 'react';
import { registerCourier, updateCourier, getCourierByDocumentNumber } from '../services/CourierService';
import { normalizeCourierError } from '../utils/courierErrors';
import { useAuth } from './useAuth';

/**
 * Manages the courier registration/update requests and exposes outcomes.
 */
export const useCourier = () => {
  const { logout } = useAuth();
  
  // Estados unificados basados en develop
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalMessage, setGlobalMessage] = useState(null);
  const [severity, setSeverity] = useState('error');
  
  // A ref blocks a second submit fired before the state update is rendered.
  const inFlightRef = useRef(false);

  const clearFeedback = () => {
    setIsSuccess(false);
    setRegisteredEmail(null);
    setFieldErrors({});
    setGlobalMessage(null);
  };

  // ------------------------------------
  // REGISTRO (Logica de Develop)
  // ------------------------------------
  const register = async (payload) => {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    setIsSubmitting(true);
    clearFeedback();

    try {
      const response = await registerCourier(payload);
      setRegisteredEmail(response?.email ?? payload.email);
      setIsSuccess(true);
      return { ok: true };
    } catch (error) {
      const normalized = normalizeCourierError(error);
      setFieldErrors(normalized.fieldErrors);
      setGlobalMessage(normalized.globalMessage);
      setSeverity(normalized.severity);
      return { ok: false, fieldErrors: normalized.fieldErrors };
    } finally {
      inFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ------------------------------------
  // ACTUALIZACIÓN (Lógica de tu Feature)
  // ------------------------------------
  const handleUpdate = async (documentNumber, courierData) => {
    setIsSubmitting(true);
    clearFeedback();

    try {
      const response = await updateCourier(documentNumber, courierData);
      setIsSuccess(true);
      return response;
    } catch (err) {
      if (err.response?.status === 401 && logout) {
        logout();
      }
      const msg = err.response?.data?.message || err.message || 'Error al actualizar datos del mensajero.';
      setGlobalMessage(msg);
      setSeverity('error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------
  // OBTENER MENSAJERO (Lógica de tu Feature adaptada)
  // ------------------------------------
  const handleGetByDocumentNumber = async (documentNumber) => {
    setIsSubmitting(true);
    clearFeedback();

    try {
      const data = await getCourierByDocumentNumber(documentNumber);
      return data;
    } catch (err) {
      if (err.response?.status === 401 && logout) {
        logout();
      }
      const msg = err.response?.data?.message || err.message || 'Mensajero no encontrado.';
      setGlobalMessage(msg);
      setSeverity('error');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------
  // MANEJO DE ERRORES FRONTEND (Develop)
  // ------------------------------------
  const setValidationErrors = (errors) => {
    setIsSuccess(false);
    setGlobalMessage(null);
    setFieldErrors(errors);
  };

  const setFieldError = (name, message) => {
    setFieldErrors((previous) => ({ ...previous, [name]: message }));
  };

  const clearFieldError = (name) => {
    setFieldErrors((previous) => {
      if (!previous[name]) return previous;
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  return {
    // Estados nativos de develop
    isSubmitting,
    isSuccess,
    registeredEmail,
    fieldErrors,
    globalMessage,
    severity,
    
    // Alias para compatibilidad con tu código actual de EditMessenger
    loading: isSubmitting,
    error: severity === 'error' ? globalMessage : null,
    success: isSuccess,
    
    // Funciones
    register,
    registerCourier: register, // Alias por si lo estabas usando así
    updateCourier: handleUpdate,
    getCourierByDocumentNumber: handleGetByDocumentNumber,
    resetState: clearFeedback,
    setValidationErrors,
    setFieldError,
    clearFieldError,
  };
};

export default useCourier;