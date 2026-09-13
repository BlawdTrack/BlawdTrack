package com.blawdgourmet.blawdtrack.auth.service;

/**
 * Resultado interno de {@link PasswordResetService#requestPasswordReset(String)}
 * (Task #62).
 * <p>
 * No es la respuesta HTTP del endpoint (esa es siempre el mismo mensaje
 * genérico, ver {@code PasswordResetController}): es el contrato que otra
 * task (envío del correo) usará para obtener el token en texto plano, que
 * nunca se persiste ni se expone por la API.
 *
 * @param tokenGenerated si el correo era válido y la cuenta estaba activa,
 *                        y por lo tanto se generó y persistió un token
 * @param rawToken        valor plano del token (solo presente cuando
 *                        {@code tokenGenerated} es {@code true}); es lo que
 *                        se enviaría por correo, nunca lo que se guarda en BD
 * @param userId           id del usuario para el que se generó el token (solo
 *                        presente cuando {@code tokenGenerated} es {@code true})
 */
public record PasswordResetResult(boolean tokenGenerated, String rawToken, Long userId) {

    public static PasswordResetResult notGenerated() {
        return new PasswordResetResult(false, null, null);
    }

    public static PasswordResetResult generated(String rawToken, Long userId) {
        return new PasswordResetResult(true, rawToken, userId);
    }
}
