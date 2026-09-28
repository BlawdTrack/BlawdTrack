package com.blawdgourmet.blawdtrack.auth.exception;

public class ContrasenaReutilizadaException extends RuntimeException {

    public ContrasenaReutilizadaException() {
        super("La nueva contraseña no puede coincidir con las últimas contraseñas utilizadas.");
    }
}
