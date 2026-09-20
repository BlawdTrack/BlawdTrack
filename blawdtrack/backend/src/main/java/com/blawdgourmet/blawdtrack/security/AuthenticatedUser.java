package com.blawdgourmet.blawdtrack.security;

/**
* Represents the authenticated user in the current request (Spring Security principal).
* It is rebuilt from the current record in the "usuarios" table on each request,
* so it always reflects the most recent role and status (see JwtAuthenticationFilter).
 */
public record AuthenticatedUser(
        Long id,
        String cedula,
        String nombreCompleto,
        String rol
) {
}
