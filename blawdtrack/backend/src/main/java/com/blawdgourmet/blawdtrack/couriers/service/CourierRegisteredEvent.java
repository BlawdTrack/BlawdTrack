package com.blawdgourmet.blawdtrack.couriers.service;

// Solo vive en memoria durante la transacción; no generar un toString con credenciales.
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
