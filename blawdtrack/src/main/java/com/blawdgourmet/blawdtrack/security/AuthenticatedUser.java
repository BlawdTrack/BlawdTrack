package com.blawdgourmet.blawdtrack.security;

/**
 * Representa al usuario autenticado en la solicitud actual (principal de Spring Security).
 * Se reconstruye a partir del registro actual en la tabla "usuarios" en cada petición,
 * por lo que refleja siempre el rol y estado más recientes (ver JwtAuthenticationFilter).
 */
public record AuthenticatedUser(
        Long id,
        String cedula,
        String nombreCompleto,
        String rol
) {
}
