package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PackageCreationAuditServiceImpl implements PackageCreationAuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    /** Exige una transacción activa: el alta se confirma o revierte junto con los paquetes. */
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void registerCreations(AuthenticatedUser actor, List<DeliveryPackage> packages) {
        Objects.requireNonNull(actor, "actor must not be null");
        Objects.requireNonNull(packages, "packages must not be null");

        var actorReference = userRepository.getReferenceById(actor.id());
        LocalDateTime now = LocalDateTime.now();

        auditLogRepository.saveAll(packages.stream()
                .map(pkg -> AuditLog.builder()
                        .actor(actorReference)
                        .usuarioAfectado(null)
                        .action(AuditAction.PACKAGE_CREATED.getCode())
                        .details("'%s' registró el paquete %s al importarlo.".formatted(
                                actor.nombreCompleto(), pkg.getShipmentNumber()))
                        .packageId(pkg.getId())
                        .shipmentNumber(pkg.getShipmentNumber())
                        .previousStatus(null)
                        .newStatus(pkg.getStatus().name())
                        .timestamp(now)
                        .build())
                .toList());
    }
}
