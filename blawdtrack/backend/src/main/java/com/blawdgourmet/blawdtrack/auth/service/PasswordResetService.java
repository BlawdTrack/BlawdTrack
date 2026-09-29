package com.blawdgourmet.blawdtrack.auth.service;

/**
 * Solicitud de recuperación de contraseña (Task #62).
 */
public interface PasswordResetService {

    /**
     * Procesa una solicitud de recuperación para {@code email}.
     * <p>
     * Si el correo existe y la cuenta está activa, genera un token seguro,
     * persiste su hash con tiempo de expiración, envía el enlace por correo y
     * devuelve el token en texto plano en el resultado. Si el correo no existe
     * o la cuenta está inactiva, no persiste ni envía nada y devuelve un
     * resultado vacío: quien llame a este método (el controller)
     * responde igual en ambos casos para no filtrar qué correos existen.
     *
     * @param email correo indicado por quien solicita la recuperación
     * @return el resultado de la operación; ver {@link PasswordResetResult}
     */
    PasswordResetResult requestPasswordReset(String email);

    void confirmPasswordReset(String rawToken, String newPassword);
}
