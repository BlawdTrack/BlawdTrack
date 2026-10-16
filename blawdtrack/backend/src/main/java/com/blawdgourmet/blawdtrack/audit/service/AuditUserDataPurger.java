package com.blawdgourmet.blawdtrack.audit.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.users.service.UserDataPurger;

import lombok.RequiredArgsConstructor;

/**
 * La auditoría no se borra al eliminar un usuario: solo se desvincula del usuario afectado, porque el detalle de
 * cada registro conserva su documento y su nombre.
 */
@Component
@RequiredArgsConstructor
public class AuditUserDataPurger implements UserDataPurger {

    private final AuditLogRepository auditLogs;

    @Override
    public void purgeFor(Long userId) {
        auditLogs.detachAffectedUser(userId);
    }
}
