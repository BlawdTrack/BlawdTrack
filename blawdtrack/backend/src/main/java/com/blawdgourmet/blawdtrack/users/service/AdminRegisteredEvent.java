package com.blawdgourmet.blawdtrack.users.service;

/**
 * Evento que {@link AdminService#registrarAdministrador} publica al crear un administrador (HU-006). Quien lo
 * escucha, después de confirmar la transacción, envía el correo con la contraseña temporal; así {@code users}
 * no depende del módulo de correo.
 * <p>
 * Solo vive en memoria durante la transacción; {@link #toString()} no incluye la contraseña.
 */
public record AdminRegisteredEvent(Long userId, String email, String fullName, String temporaryPassword) {

    @Override
    public String toString() {
        return "AdminRegisteredEvent[userId=" + userId + "]";
    }
}
