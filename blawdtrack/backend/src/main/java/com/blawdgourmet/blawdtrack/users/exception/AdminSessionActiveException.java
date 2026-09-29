package com.blawdgourmet.blawdtrack.users.exception;

/**
 * El administrador tiene una sesión activa y no puede eliminarse hasta que se cierre (HU-008). Se
 * responde 409 {@code ADMINISTRADOR_CON_SESION_ACTIVA}.
 */
public class AdminSessionActiveException extends RuntimeException {
    public AdminSessionActiveException(String message) {
        super(message);
    }
}
