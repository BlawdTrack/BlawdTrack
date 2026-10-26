package com.blawdgourmet.blawdtrack.couriers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateCourierPasswordRequest(
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "La contraseña debe tener al menos 8 caracteres y combinar letras y números")
        String password) {
}
