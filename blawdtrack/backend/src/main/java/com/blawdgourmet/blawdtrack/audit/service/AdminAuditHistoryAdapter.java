package com.blawdgourmet.blawdtrack.audit.service;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditCategory;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.service.AdminAuditHistory;

import lombok.RequiredArgsConstructor;

/** Lee de la auditoría el historial de administradores para los endpoints de `users`. */
@Component
@RequiredArgsConstructor
public class AdminAuditHistoryAdapter implements AdminAuditHistory {

    private static final List<String> ADMIN_AUDIT_ACTIONS = AuditAction.codesOf(AuditCategory.ADMIN);

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> adminHistory() {
        return auditLogRepository.findByActionInOrderByTimestampDesc(ADMIN_AUDIT_ACTIONS).stream()
                .map(AdminAuditHistoryAdapter::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> adminHistory(Long adminId) {
        return auditLogRepository
                .findByUsuarioAfectadoIdAndActionInOrderByTimestampDescIdDesc(adminId, ADMIN_AUDIT_ACTIONS)
                .stream()
                .map(AdminAuditHistoryAdapter::toResponse)
                .toList();
    }

    private static AdminAuditLogResponse toResponse(AuditLog log) {
        return new AdminAuditLogResponse(
                log.getId(),
                log.getAction(),
                log.getActor().getFullName(),
                log.getDetails(),
                log.getTimestamp()
        );
    }
}
