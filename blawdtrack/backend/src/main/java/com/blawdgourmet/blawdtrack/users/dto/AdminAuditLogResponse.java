package com.blawdgourmet.blawdtrack.users.dto;

import java.time.LocalDateTime;

/**
 * Fila del historial de auditoría de administradores (HU-006 / T06): creación
 * y eliminación de "Administrador de Ventas". El actor de ambas acciones
 * siempre es un Súper Usuario (impuesto por @PreAuthorize en AdminController),
 * así que no se expone su rol por separado.
 */
public record AdminAuditLogResponse(
        Long id,
        String action,
        String actorName,
        String details,
        LocalDateTime timestamp
) {
}
