package com.blawdgourmet.blawdtrack.couriers.dto;

import java.math.BigDecimal;

import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/**
 * Mensajero tal como lo devuelve la API: los datos del perfil ({@code id}, horario y capacidad) más
 * los de su cuenta de usuario (documento, nombre, contacto, estado y rol). Nunca incluye contraseñas.
 * {@code id} es el id del perfil (tabla {@code mensajeros}); {@code userId}, el de la cuenta.
 */
public record CourierResponse(Long id, Long userId, DocumentType documentType, String documentNumber,
                              String fullName, String email, String phone, String schedule,
                              BigDecimal maxPackageWeightKg, UserStatus status, String role) {
    /** Construye la respuesta a partir del perfil y de su cuenta asociada. */
    public static CourierResponse from(Courier courier) {
        var user = courier.getUser();
        return new CourierResponse(courier.getId(), user.getId(), user.getDocumentType(), user.getDocumentNumber(),
                user.getFullName(), user.getEmail(), user.getPhone(), courier.getSchedule(),
                courier.getMaxPackageWeightKg(), user.getStatus(), user.getRole().getName());
    }
}
