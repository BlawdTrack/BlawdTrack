package com.blawdgourmet.blawdtrack.auth.exception;

public class PasswordReusedException extends RuntimeException {

    public PasswordReusedException() {
        super("La nueva contraseña no puede coincidir con las últimas contraseñas utilizadas.");
    }
}
