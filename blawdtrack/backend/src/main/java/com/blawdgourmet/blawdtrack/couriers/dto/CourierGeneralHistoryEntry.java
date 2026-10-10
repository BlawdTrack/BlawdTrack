package com.blawdgourmet.blawdtrack.couriers.dto;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Un cambio del historial general de mensajeros: lo mismo que {@link CourierHistoryEntry} más el
 * mensajero afectado, para poder mostrar de quién es cada cambio.
 */
public record CourierGeneralHistoryEntry(LocalDateTime timestamp, String action, String details, String actorName,
                                         String courierName, DocumentType documentType, String documentNumber) {

    public static CourierGeneralHistoryEntry from(AuditLog log) {
        var courier = log.getUsuarioAfectado();
        return new CourierGeneralHistoryEntry(log.getTimestamp(), log.getAction(), log.getDetails(),
                log.getActor().getFullName(), courier.getFullName(), courier.getDocumentType(),
                courier.getDocumentNumber());
    }
}
