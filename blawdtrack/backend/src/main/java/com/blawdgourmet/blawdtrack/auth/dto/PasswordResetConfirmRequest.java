package com.blawdgourmet.blawdtrack.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuerpo de {@code POST /api/v1/auth/password-reset/confirm} (HU-002): el token recibido por correo y la
 * nueva contraseña, que debe tener al menos 8 caracteres y combinar letras y números.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetConfirmRequest {

    @NotBlank(message = "El token es obligatorio")
    private String token;

    @NotBlank(message = "La nueva contraseña es obligatoria")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
            message = "La contraseña debe tener al menos 8 caracteres y combinar letras y números")
    private String newPassword;
}
