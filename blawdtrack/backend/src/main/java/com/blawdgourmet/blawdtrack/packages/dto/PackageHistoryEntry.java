package com.blawdgourmet.blawdtrack.packages.dto;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

/**
 * Evento visible en el historial de un paquete.
 */
public record PackageHistoryEntry(
        LocalDateTime timestamp,
        String action,
        String details,
        String actorName
) {

    public static PackageHistoryEntry from(AuditLog log) {
        return new PackageHistoryEntry(
                log.getTimestamp(),
                log.getAction(),
                log.getDetails(),
                log.getActor().getFullName()
        );
    }
}
