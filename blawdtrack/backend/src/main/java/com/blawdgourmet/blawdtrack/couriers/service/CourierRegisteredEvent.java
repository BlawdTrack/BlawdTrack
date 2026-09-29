package com.blawdgourmet.blawdtrack.couriers.service;

/**
 * Evento que {@link CourierService#register} publica al crear un mensajero. {@link CourierWelcomeListener}
 * lo recibe después de confirmar la transacción y envía el correo con la contraseña temporal.
 * <p>
 * Solo vive en memoria durante la transacción; no generar un toString con credenciales.
 */
final class CourierRegisteredEvent {
    final Long userId;
    final String email;
    final String fullName;
    final String temporaryPassword;

    CourierRegisteredEvent(Long userId, String email, String fullName, String temporaryPassword) {
        this.userId = userId;
        this.email = email;
        this.fullName = fullName;
        this.temporaryPassword = temporaryPassword;
    }
}
