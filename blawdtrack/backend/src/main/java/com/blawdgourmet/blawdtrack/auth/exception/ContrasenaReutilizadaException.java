package com.blawdgourmet.blawdtrack.auth.exception;

/**
 * La nueva contraseña coincide con la actual o con una de las últimas usadas. Se responde 400 con el
 * código {@code CONTRASENA_REUTILIZADA} (ver {@code GlobalExceptionHandler}).
 */
public class ContrasenaReutilizadaException extends RuntimeException {

    public ContrasenaReutilizadaException() {
        super("La nueva contraseña no puede coincidir con las últimas contraseñas utilizadas.");
    }
}
