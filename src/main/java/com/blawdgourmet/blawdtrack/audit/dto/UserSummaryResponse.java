package com.blawdgourmet.blawdtrack.audit.dto;

/**
 * Minimal data of the authenticated user, used by the frontend to redirect
 * to the main screen that corresponds to their role.
 *
 * @param id       internal user identifier
 * @param fullName user's full name
 * @param email    user's email address
 * @param role     assigned role name (SUPER_USUARIO, ADMIN_VENTAS, MENSAJERO)
 */
public record UserSummaryResponse(
        Long id,
        String fullName,
        String email,
        String role
) {
}
