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

    /**
     * Envía el enlace de restablecimiento al correo de la propia cuenta autenticada. El correo nunca
     * lo indica el cliente: se toma del usuario de la sesión, así que nadie puede pedirlo para otra
     * cuenta. Los enlaces anteriores de esa cuenta dejan de valer.
     *
     * @param userId id del usuario autenticado
     * @throws com.blawdgourmet.blawdtrack.auth.exception.PasswordResetEmailException si el correo no
     *         pudo enviarse (en ese caso no queda ningún token guardado)
     */
    void requestOwnPasswordReset(Long userId);

    void confirmPasswordReset(String rawToken, String newPassword);
}
