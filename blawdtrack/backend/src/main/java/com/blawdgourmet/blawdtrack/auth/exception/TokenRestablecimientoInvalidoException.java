package com.blawdgourmet.blawdtrack.auth.exception;

public class TokenRestablecimientoInvalidoException extends RuntimeException {

    public TokenRestablecimientoInvalidoException() {
        super("El enlace de restablecimiento no es válido o ha expirado.");
    }
}
