package com.blawdgourmet.blawdtrack.couriers.dto;

import java.math.BigDecimal;
import java.util.Locale;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de {@code POST /api/v1/couriers}. El constructor compacto limpia los datos: recorta
 * espacios, pasa el correo a minúsculas, deja el teléfono vacío como nulo y usa CEDULA si no llega el
 * tipo de documento. {@code maxPackageWeightKg} debe ser positivo (hasta 8 enteros y 2 decimales).
 */
public record CreateCourierRequest(
        @NotNull DocumentType documentType,
        @JsonAlias({"documentId"}) @NotBlank @Size(max = 50) String documentNumber,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 120) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 255) String schedule,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal maxPackageWeightKg
) {
    public CreateCourierRequest {
        documentType = documentType == null ? DocumentType.CEDULA : documentType;
        documentNumber = trim(documentNumber);
        fullName = trim(fullName);
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        phone = trim(phone);
        if (phone != null && phone.isEmpty()) phone = null;
        schedule = trim(schedule);
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}