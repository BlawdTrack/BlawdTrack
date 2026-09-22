package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.validation.DocumentHolder;
import com.blawdgourmet.blawdtrack.users.validation.ValidDocument;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload para POST /api/v1/admins (HU-006 / CU-006 Crear administrador).
 * Los nombres de propiedad están en camelCase según el estándar P13 (DTOs/JSON).
 */
@ValidDocument(message = "Identity document is not in a valid format.")
public record AdminRegistrationRequest(

        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name cannot exceed 120 characters.")
        String nombreCompleto,

        @NotBlank(message = "Phone number is required.")
        @Size(max = 20, message = "Phone number cannot exceed 20 characters.")
        String numeroTelefono,

        @NotBlank(message = "Email address is required.")
        @Email(message = "Email address is not in a valid format.")
        @Size(max = 120, message = "Email address cannot exceed 120 characters.")
        String correoElectronico,

        @NotBlank(message = "Initial password is required.")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
                message = "The password must be at least 8 characters long and combine letters and numbers."
        )
        String contrasenaInicial,

        @NotNull(message = "Identity document type is required.")
        DocumentType documentType,

        @NotBlank(message = "Identity document is required.")
        @Size(max = 20, message = "Identity document cannot exceed 20 characters.")
        String documentNumber
) implements DocumentHolder {
}
