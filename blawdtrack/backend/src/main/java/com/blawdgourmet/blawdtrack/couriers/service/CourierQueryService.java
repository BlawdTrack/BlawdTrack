package com.blawdgourmet.blawdtrack.couriers.service;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierDeactivationEntry;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierGeneralHistoryEntry;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierHistoryEntry;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;

import lombok.RequiredArgsConstructor;

/** Consultas de mensajeros: la lista y los historiales que salen de la auditoría. Solo lectura. */
@Service
@RequiredArgsConstructor
public class CourierQueryService {

    private static final List<String> COURIER_AUDIT_ACTIONS = List.of(
            AuditAction.COURIER_CREATED.getCode(),
            AuditAction.COURIER_UPDATED.getCode(),
            AuditAction.COURIER_DEACTIVATED.getCode(),
            AuditAction.COURIER_ACTIVATED.getCode(),
            AuditAction.COURIER_PASSWORD_CHANGED.getCode());

    private final CourierRepository couriers;
    private final AuditLogRepository auditLogs;
    private final CourierLookup lookup;

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierResponse> list() {
        return couriers.findAllByOrderByUserFullNameAsc()
                .stream()
                .map(CourierResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierHistoryEntry> history(String id) {
        var user = lookup.resolve(id).getUser();

        return auditLogs.findByUsuarioAfectadoIdAndActionInOrderByTimestampDescIdDesc(
                        user.getId(), COURIER_AUDIT_ACTIONS)
                .stream()
                .map(CourierHistoryEntry::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierGeneralHistoryEntry> generalHistory() {
        return auditLogs.findByActionInOrderByTimestampDescIdDesc(COURIER_AUDIT_ACTIONS)
                .stream()
                .filter(log -> log.getUsuarioAfectado() != null)
                .map(CourierGeneralHistoryEntry::from)
                .toList();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierDeactivationEntry> deactivations() {
        return auditLogs.findByActionOrderByTimestampDescIdDesc(AuditAction.COURIER_DEACTIVATED.getCode())
                .stream()
                .filter(log -> log.getUsuarioAfectado() != null)
                .map(CourierDeactivationEntry::from)
                .toList();
    }
}
