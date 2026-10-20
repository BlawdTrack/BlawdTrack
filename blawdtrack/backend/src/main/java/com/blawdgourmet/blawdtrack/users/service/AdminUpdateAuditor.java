package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

import lombok.RequiredArgsConstructor;

/**
 * Deja en la bitácora de administradores lo que el Super Usuario cambió en un administrador (HU-007). El texto dice
 * quién hizo qué y a quién, y nunca incluye la contraseña ni los valores anteriores o nuevos.
 */
@Component
@RequiredArgsConstructor
public class AdminUpdateAuditor {

    private static final String SESSION_CLOSED_NOTE = " Su sesión activa se cerró de inmediato.";

    private final UserAuditTrail auditTrail;

    /** Registra el cambio de datos de perfil; si no cambió ningún campo no deja nada. */
    public void profileChanged(AuthenticatedUser actor, User admin, List<String> profileFields) {
        if (profileFields.isEmpty()) {
            return;
        }
        auditTrail.adminUpdated(actor, admin,
                detail(actor, admin, "modificó los datos (" + String.join(", ", profileFields) + ") del"));
    }

    /** Registra la activación o desactivación, según el estado en que quedó el administrador. */
    public void statusChanged(AuthenticatedUser actor, User admin) {
        if (admin.getStatus() == UserStatus.INACTIVE) {
            auditTrail.adminDeactivated(actor, admin, detail(actor, admin, "desactivó al") + SESSION_CLOSED_NOTE);
        } else {
            auditTrail.adminActivated(actor, admin, detail(actor, admin, "activó al") + SESSION_CLOSED_NOTE);
        }
    }

    public void passwordChanged(AuthenticatedUser actor, User admin) {
        auditTrail.adminPasswordChanged(actor, admin,
                detail(actor, admin, "cambió la contraseña del") + SESSION_CLOSED_NOTE);
    }

    private static String detail(AuthenticatedUser actor, User admin, String action) {
        return "El Super Usuario '%s' %s Administrador de Ventas '%s' (%s %s)."
                .formatted(actor.nombreCompleto(), action, admin.getFullName(),
                        admin.getDocumentType(), admin.getDocumentNumber());
    }
}
