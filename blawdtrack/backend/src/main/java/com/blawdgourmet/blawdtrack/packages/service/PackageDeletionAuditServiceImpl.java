package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalDateTime;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PackageDeletionAuditServiceImpl implements PackageDeletionAuditService {

    private static final int MAX_DETAILS_LENGTH = 500;

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /** Exige una transacción activa: el registro se confirma o revierte junto con el borrado. */
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void registerDeletion(AuthenticatedUser actor, String shipmentNumber, PackageStatus status) {
        Objects.requireNonNull(actor, "actor must not be null");
        Objects.requireNonNull(shipmentNumber, "shipmentNumber must not be null");
        Objects.requireNonNull(status, "status must not be null");

        String details = "El Administrador de Ventas '%s' (documento %s) eliminó el paquete '%s' (estado: %s)."
                .formatted(
                        actor.nombreCompleto(),
                        actor.documentType() + "-" + actor.documentNumber(),
                        shipmentNumber,
                        status.getCode());

        AuditLog auditLog = AuditLog.builder()
                .actor(userRepository.getReferenceById(actor.id()))
                .usuarioAfectado(null)
                .action(AuditAction.PACKAGE_DELETED.getCode())
                .details(details.length() > MAX_DETAILS_LENGTH ? details.substring(0, MAX_DETAILS_LENGTH) : details)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }
}
