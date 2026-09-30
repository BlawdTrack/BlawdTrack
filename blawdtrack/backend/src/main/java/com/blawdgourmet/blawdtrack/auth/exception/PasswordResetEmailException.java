package com.blawdgourmet.blawdtrack.auth.exception;

/**
 * No se pudo enviar el correo de restablecimiento de la propia contraseña (el servidor de correo no
 * respondió o rechazó el envío). Se responde 503 con el código {@code CORREO_NO_ENVIADO} (ver
 * {@code GlobalExceptionHandler}); a diferencia de la recuperación pública, aquí el usuario está
 * autenticado y es su propio correo, así que no hay nada que ocultar y el fallo se le informa.
 */
public class PasswordResetEmailException extends RuntimeException {

    public PasswordResetEmailException(Throwable cause) {
        super("No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo más tarde o avisa al "
                + "administrador del sistema.", cause);
    }
}
