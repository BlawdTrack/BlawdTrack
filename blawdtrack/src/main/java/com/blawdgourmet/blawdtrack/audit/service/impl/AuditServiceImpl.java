package com.blawdgourmet.blawdtrack.audit.service.impl;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditServiceImpl implements AuditService {

    private static final int MAX_DETAILS_LENGTH = 500;

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    public void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado) {
        String detalle = "El Super Usuario '%s' (%s %s) creó al Administrador de Ventas '%s' (%s %s, correo %s)."
                .formatted(
                        actor.nombreCompleto(),
                        actor.documentType(),
                        actor.documentNumber(),
                        administradorCreado.getFullName(),
                        administradorCreado.getDocumentType(),
                        administradorCreado.getDocumentNumber(),
                        administradorCreado.getEmail()
                );

        logAction(AuditAction.ADMIN_CREATED, actor, administradorCreado, detalle);
    }

    /** Exige una transacción activa: la traza se confirma o revierte junto con el cambio. */
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void logAction(AuditAction action, AuthenticatedUser actor, User affected, String details) {
        Objects.requireNonNull(action, "action must not be null");
        Objects.requireNonNull(actor, "actor must not be null");
        Objects.requireNonNull(affected, "affected must not be null");

        User actorReference = userRepository.getReferenceById(actor.id());

        AuditLog auditLog = AuditLog.builder()
                .actor(actorReference)
                .usuarioAfectado(affected)
                .action(action.getCode())
                .details(truncate(details))
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    private static String truncate(String details) {
        if (details == null) {
            return null;
        }
        return details.length() > MAX_DETAILS_LENGTH ? details.substring(0, MAX_DETAILS_LENGTH) : details;
    }
}
