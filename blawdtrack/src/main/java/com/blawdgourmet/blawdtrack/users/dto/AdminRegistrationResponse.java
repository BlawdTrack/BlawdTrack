package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

public record AdminRegistrationResponse(
        Long id,
        DocumentType tipoDocumento,
        String numeroDocumento,
        String nombreCompleto,
        String correoElectronico,
        String numeroTelefono,
        String rol,
        UserStatus estado
) {
}
