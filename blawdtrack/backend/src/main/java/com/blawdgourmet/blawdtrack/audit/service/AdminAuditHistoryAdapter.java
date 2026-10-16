package com.blawdgourmet.blawdtrack.audit.service;

import java.util.List;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.service.AdminAuditHistory;

import lombok.RequiredArgsConstructor;

/** Lee de la auditoría las altas y bajas de administradores para el endpoint de `users`. */
@Component
@RequiredArgsConstructor
public class AdminAuditHistoryAdapter implements AdminAuditHistory {

    // "ELIMINAR_ADMINISTRADOR" refleja AuditServiceImpl.ACCION_ELIMINAR_ADMINISTRADOR (aún no está en el enum
    // AuditAction: se escribe directo en registrarEliminacionAdministrador en vez de pasar por logAction).
    private static final List<String> ADMIN_AUDIT_ACTIONS = List.of(
            AuditAction.ADMIN_CREATED.getCode(), "ELIMINAR_ADMINISTRADOR");

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> adminHistory() {
        return auditLogRepository.findByActionInOrderByTimestampDesc(ADMIN_AUDIT_ACTIONS).stream()
                .map(log -> new AdminAuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getActor().getFullName(),
                        log.getDetails(),
                        log.getTimestamp()
                ))
                .toList();
    }
}
