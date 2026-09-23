package com.blawdgourmet.blawdtrack.couriers.dto;

import java.math.BigDecimal;
import java.util.Locale;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateCourierRequest(
        @NotBlank @Size(max = 20) String documentId,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 120) String email,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 255) String schedule,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal maxPackageWeightKg
) {
    public CreateCourierRequest {
        documentId = trim(documentId);
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