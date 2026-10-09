package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordHistoryRepository;
import com.blawdgourmet.blawdtrack.auth.repository.PasswordResetTokenRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserPermissionRepository;

import lombok.RequiredArgsConstructor;

/**
 * Deja libre a un usuario de los registros que lo referencian con clave foránea, para poder
 * eliminarlo. La auditoría no se borra: solo se desvincula del usuario afectado.
 */
@Component
@RequiredArgsConstructor
public class UserRelatedRecordsCleaner {

    private final AuditLogRepository auditLogs;
    private final PasswordResetTokenRepository resetTokens;
    private final PasswordHistoryRepository passwordHistory;
    private final UserPermissionRepository userPermissions;

    public void removeFor(Long userId) {
        auditLogs.detachAffectedUser(userId);
        resetTokens.deleteByUserId(userId);
        passwordHistory.deleteByUserId(userId);
        userPermissions.deleteByUserId(userId);
    }
}
