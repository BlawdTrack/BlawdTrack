package com.blawdgourmet.blawdtrack.common.security;

import org.springframework.security.core.AuthenticatedPrincipal;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Representa al usuario autenticado en la solicitud actual (principal de Spring Security).
 */
public record AuthenticatedUser(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String nombreCompleto,
        String rol,
        String correo
) implements AuthenticatedPrincipal {

    @Override
    public String getName() {
        return correo;
    }
}
