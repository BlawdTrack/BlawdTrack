package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/** Administrador recién creado (HU-006). No incluye la contraseña. Los nombres siguen el contrato del formulario. */
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
