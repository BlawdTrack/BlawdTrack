package com.blawdgourmet.blawdtrack.common.security;

import org.springframework.security.core.AuthenticatedPrincipal;

/**
 * Representa al usuario autenticado en la solicitud actual (principal de Spring Security).
 */
public record AuthenticatedUser(
        Long id,
        String cedula,
        String nombreCompleto,
        String rol,
        String correo
) implements AuthenticatedPrincipal {

    @Override
    public String getName() {
        return correo;
    }
}
