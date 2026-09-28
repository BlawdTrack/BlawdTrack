package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/**
 * Fila del listado de administradores (HU-008). Incluye el estado de sesión
 * aproximado usado para habilitar o no el botón de eliminar en el frontend.
 */
public record AdminSummaryResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String fullName,
        String email,
        String phone,
        UserStatus status,
        boolean hasActiveSession
) {
}
