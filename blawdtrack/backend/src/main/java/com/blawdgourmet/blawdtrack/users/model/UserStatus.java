package com.blawdgourmet.blawdtrack.users.model;

/**
 * Estado de acceso de una cuenta. Una cuenta {@code INACTIVE} no puede iniciar sesión y sus tokens
 * dejan de ser válidos en la siguiente solicitud.
 */
public enum UserStatus {
    ACTIVE,
    INACTIVE
}
