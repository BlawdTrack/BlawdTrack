package com.blawdgourmet.blawdtrack.users.dto;

import java.util.Locale;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.validation.DocumentHolder;
import com.blawdgourmet.blawdtrack.users.validation.DocumentNormalizer;
import com.blawdgourmet.blawdtrack.users.validation.ValidDocument;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Payload para POST /api/v1/admins (HU-006 / CU-006 Crear administrador). No lleva contraseña: el sistema genera
 * una temporal y la envía por correo al nuevo administrador.
 * Los nombres de propiedad están en camelCase según el estándar P13 (DTOs/JSON).
 */
@ValidDocument
public record AdminRegistrationRequest(

        @NotBlank(message = "Full name is required.")
        @Size(max = 120, message = "Full name cannot exceed 120 characters.")
        String nombreCompleto,

        @NotBlank(message = "Phone number is required.")
        @Size(max = 20, message = "Phone number cannot exceed 20 characters.")
        String numeroTelefono,

        @NotBlank(message = "Email address is required.")
        @Email(message = "Email address is not in a valid format.")
        @Pattern(regexp = "^[^@\\s]+@[^@\\s]+\\.[^@\\s]{2,}$", message = "Email address is not in a valid format.")
        @Size(max = 120, message = "Email address cannot exceed 120 characters.")
        String correoElectronico,

        @NotNull(message = "Document type is required.")
        DocumentType documentType,

        @NotBlank(message = "Document number is required.")
        String documentNumber
) implements DocumentHolder {

    public AdminRegistrationRequest {
        nombreCompleto = nombreCompleto == null ? null : nombreCompleto.trim();
        numeroTelefono = numeroTelefono == null ? null : numeroTelefono.trim();
        correoElectronico = correoElectronico == null ? null : correoElectronico.trim().toLowerCase(Locale.ROOT);
        documentNumber = DocumentNormalizer.normalize(documentType, documentNumber);
    }

    public AdminRegistrationRequest(
            String nombreCompleto,
            String numeroTelefono,
            String correoElectronico,
            String documentNumber) {
        this(nombreCompleto, numeroTelefono, correoElectronico, DocumentType.CEDULA, documentNumber);
    }

    @Override
    public DocumentType getDocumentType() {
        return documentType;
    }

    @Override
    public String getDocumentNumber() {
        return documentNumber;
    }
}
