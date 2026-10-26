package com.blawdgourmet.blawdtrack.auth.exception;

/**
 * El token de restablecimiento no existe, ya se usó o venció. Se responde 400 con el código
 * {@code TOKEN_INVALIDO} (ver {@code GlobalExceptionHandler}).
 */
public class InvalidResetTokenException extends RuntimeException {

    public InvalidResetTokenException() {
        super("El enlace de restablecimiento no es válido o ha expirado.");
    }
}
