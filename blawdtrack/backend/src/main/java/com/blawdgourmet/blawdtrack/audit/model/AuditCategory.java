package com.blawdgourmet.blawdtrack.audit.model;

/**
 * Agrupa las acciones auditables según el historial al que pertenecen. Cada historial pide las acciones de su
 * categoría, así que una acción nueva aparece en el historial correcto con solo declararla en {@link AuditAction}.
 */
public enum AuditCategory {
    COURIER,
    ADMIN,
    USER_PERMISSIONS,
    PACKAGE
}
