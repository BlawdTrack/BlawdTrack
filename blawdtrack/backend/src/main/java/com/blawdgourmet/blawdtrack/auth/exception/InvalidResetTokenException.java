package com.blawdgourmet.blawdtrack.auth.exception;

public class InvalidResetTokenException extends RuntimeException {

    public InvalidResetTokenException() {
        super("El enlace de restablecimiento no es válido o ha expirado.");
    }
}
