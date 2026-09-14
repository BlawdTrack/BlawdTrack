package com.blawdgourmet.blawdtrack.audit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Input data for the login endpoint (HU-001).
 *
 * @param email    user's registered email address
 * @param password plain-text password sent by the client (travels over HTTPS)
 */
public record LoginRequest(

        @NotBlank(message = "El correo electronico es obligatorio.")
        @Email(message = "El correo electronico no tiene un formato valido.")
        String email,

        @NotBlank(message = "La contrasena es obligatoria.")
        String password
) {
}
