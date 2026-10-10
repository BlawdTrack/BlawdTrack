package com.blawdgourmet.blawdtrack.packages.dto;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

/**
 * Entrada del historial de cambios de estado de un paquete.
 */
public record PackageHistoryEntry(
        LocalDateTime timestamp,
        String action,
        String details,
        String actorName,
        String previousStatus,
        String newStatus
) {

    /**
     * Crea una entrada de historial a partir de un registro de auditoría.
     */
    public static PackageHistoryEntry from(AuditLog log) {
        return new PackageHistoryEntry(
                log.getTimestamp(),
                log.getAction(),
                log.getDetails(),
                log.getActor() != null ? log.getActor().getFullName() : null,
                normalizeStatus(log.getPreviousStatus()),
                normalizeStatus(log.getNewStatus())
        );
    }

    private static String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "DESCONOCIDO";
        }
        return status.trim();
    }
}