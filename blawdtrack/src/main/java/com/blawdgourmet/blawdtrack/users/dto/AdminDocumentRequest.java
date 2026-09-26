package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.validation.DocumentHolder;
import com.blawdgourmet.blawdtrack.users.validation.ValidDocument;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Identifica a un administrador por su documento en las rutas
 * /api/v1/admins/{documentType}/{documentNumber}/... (HU-008).
 * Se enlaza desde las variables de ruta y se valida con {@link ValidDocument}.
 */
@ValidDocument(message = "Identity document is not in a valid format.")
public record AdminDocumentRequest(

        @NotNull(message = "Identity document type is required.")
        DocumentType documentType,

        @NotBlank(message = "Identity document is required.")
        @Size(max = 20, message = "Identity document cannot exceed 20 characters.")
        String documentNumber
) implements DocumentHolder {
}
