package com.blawdgourmet.blawdtrack.audit.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.service.UserAuditTrail;

import lombok.RequiredArgsConstructor;

/** Adaptador de auditoría para `users`: traduce cada hecho del puerto a su registro en {@link AuditService}. */
@Component
@RequiredArgsConstructor
public class UserAuditTrailAdapter implements UserAuditTrail {

    private final AuditService auditService;

    @Override
    public void adminCreated(AuthenticatedUser actor, User admin) {
        auditService.registrarCreacionAdministrador(actor, admin);
    }

    @Override
    public void adminDeleted(AuthenticatedUser actor, User admin) {
        auditService.registrarEliminacionAdministrador(actor, admin);
    }

    @Override
    public void adminUpdated(AuthenticatedUser actor, User admin, String details) {
        auditService.logAction(AuditAction.ADMIN_UPDATED, actor, admin, details);
    }

    @Override
    public void adminActivated(AuthenticatedUser actor, User admin, String details) {
        auditService.logAction(AuditAction.ADMIN_ACTIVATED, actor, admin, details);
    }

    @Override
    public void adminDeactivated(AuthenticatedUser actor, User admin, String details) {
        auditService.logAction(AuditAction.ADMIN_DEACTIVATED, actor, admin, details);
    }

    @Override
    public void adminPasswordChanged(AuthenticatedUser actor, User admin, String details) {
        auditService.logAction(AuditAction.ADMIN_PASSWORD_CHANGED, actor, admin, details);
    }

    @Override
    public void permissionsUpdated(AuthenticatedUser actor, User affected, String details) {
        auditService.logAction(AuditAction.USER_PERMISSIONS_UPDATED, actor, affected, details);
    }

    @Override
    public void permissionsReset(AuthenticatedUser actor, User affected, String details) {
        auditService.logAction(AuditAction.USER_PERMISSIONS_RESET, actor, affected, details);
    }
}
