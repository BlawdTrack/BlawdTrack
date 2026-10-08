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
        String[] statuses = extractStatuses(log.getDetails());
        return new PackageHistoryEntry(
                log.getTimestamp(),
                log.getAction(),
                log.getDetails(),
                log.getActor().getFullName(),
                statuses[0],
                statuses[1]
        );
    }

    /**
     * Extrae los estados anterior y nuevo del detalle de la auditoría.
     * Formato esperado: "El usuario X cambió el estado del paquete ENV-123 de PENDING a ASSIGNED"
     */
    private static String[] extractStatuses(String details) {
        String previous = "DESCONOCIDO";
        String current = "DESCONOCIDO";

        if (details != null) {
            // Buscar patrón "de <estado> a <estado>"
            int deIndex = details.indexOf(" de ");
            int aIndex = details.indexOf(" a ", deIndex);
            if (deIndex != -1 && aIndex != -1 && aIndex > deIndex) {
                previous = details.substring(deIndex + 4, aIndex).trim();
                current = details.substring(aIndex + 3).trim();
            }
        }

        return new String[]{previous, current};
    }
}