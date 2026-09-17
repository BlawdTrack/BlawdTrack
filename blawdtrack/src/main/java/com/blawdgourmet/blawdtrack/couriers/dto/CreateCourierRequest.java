package com.blawdgourmet.blawdtrack.couriers.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public record CreateCourierRequest(
        @NotBlank @Size(max = 20) String nationalId,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(max = 72) String password,
        @Size(max = 20) String phone,
        @NotBlank @Size(max = 255) String schedule,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal maxPackageWeightKg
) {
    public CreateCourierRequest {
        nationalId = trim(nationalId);
        fullName = trim(fullName);
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        phone = trim(phone);
        schedule = trim(schedule);
    }

    // BCrypt acepta como máximo 72 bytes, incluso para contraseñas Unicode.
    @AssertTrue(message = "La contraseña no puede superar 72 bytes UTF-8")
    public boolean isPasswordWithinByteLimit() {
        return password == null || password.getBytes(StandardCharsets.UTF_8).length <= 72;
    }

    private static String trim(String value) {
        return value == null ? null : value.trim();
    }
}