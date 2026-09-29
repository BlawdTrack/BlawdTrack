package com.blawdgourmet.blawdtrack.couriers.dto;

import java.time.LocalDateTime;

import com.blawdgourmet.blawdtrack.audit.model.AuditLog;

public record CourierHistoryEntry(LocalDateTime timestamp, String action, String details, String actorName) {

    public static CourierHistoryEntry from(AuditLog log) {
        return new CourierHistoryEntry(log.getTimestamp(), log.getAction(), log.getDetails(),
                log.getActor().getFullName());
    }
}
