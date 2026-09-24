package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

public record AdminRegistrationResponse(
        Long id,
        String documentNumber,
        String nombreCompleto,
        String correoElectronico,
        String numeroTelefono,
        String rol,
        UserStatus estado
) {
}
