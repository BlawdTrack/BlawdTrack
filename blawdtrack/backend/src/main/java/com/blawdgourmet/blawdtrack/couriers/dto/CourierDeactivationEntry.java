package com.blawdgourmet.blawdtrack.couriers.dto;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Una desactivación registrada en la auditoría, con el mensajero afectado y quién la hizo. Se conserva
 * aunque el mensajero se vuelva a activar: la auditoría nunca se borra.
 */
public record CourierDeactivationEntry(LocalDateTime timestamp, String courierName, DocumentType documentType,
                                       String documentNumber, String actorName) {

    public static CourierDeactivationEntry from(AuditLog log) {
        var courier = log.getUsuarioAfectado();
        return new CourierDeactivationEntry(log.getTimestamp(), courier.getFullName(), courier.getDocumentType(),
                courier.getDocumentNumber(), log.getActor().getFullName());
    }
}
