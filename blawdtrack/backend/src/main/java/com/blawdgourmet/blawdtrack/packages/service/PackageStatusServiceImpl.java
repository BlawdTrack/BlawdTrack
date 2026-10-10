package com.blawdgourmet.blawdtrack.packages.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Implementación del servicio de cambio de estado de paquetes.
 * Registra cada cambio en la tabla de auditoría.
 */
@Service
@RequiredArgsConstructor
public class PackageStatusServiceImpl implements PackageStatusService {

    private static final int MAX_DETAILS_LENGTH = 500;

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public DeliveryPackage changeStatus(DeliveryPackage pkg, PackageStatus newStatus,
            AuthenticatedUser actor, String details) {

        PackageStatus previousStatus = pkg.getStatus();

        // Si el estado no cambia, no hacer nada
        if (previousStatus == newStatus) {
            return pkg;
        }

        // Actualizar el estado del paquete
        pkg.setStatus(newStatus);

        // Registrar en auditoría
        logStatusChange(pkg, previousStatus, newStatus, actor, details);

        return pkg;
    }

    /**
     * Registra el cambio de estado en la tabla de auditoría.
     */
    private void logStatusChange(DeliveryPackage pkg, PackageStatus previousStatus,
            PackageStatus newStatus, AuthenticatedUser actor, String details) {

        User actorReference = userRepository.getReferenceById(actor.id());

        String actionCode;
        String defaultDetails;

        // Determinar la acción basada en el cambio
        if (previousStatus == PackageStatus.PENDING && newStatus == PackageStatus.ASSIGNED) {
            actionCode = AuditAction.PACKAGE_ASSIGNED.getCode();
            defaultDetails = "El usuario '%s' asignó el paquete %s al mensajero.";
        } else if (previousStatus == PackageStatus.ASSIGNED && newStatus == PackageStatus.PENDING) {
            actionCode = AuditAction.PACKAGE_UNASSIGNED.getCode();
            defaultDetails = "El usuario '%s' desasignó el paquete %s del mensajero.";
        } else {
            actionCode = AuditAction.PACKAGE_STATUS_CHANGED.getCode();
            defaultDetails = "El usuario '%s' cambió el estado del paquete %s de %s a %s.";
        }

        String finalDetails = (details != null && !details.isBlank()) ? details
                : defaultDetails.formatted(actor.nombreCompleto(), pkg.getShipmentNumber(),
                        previousStatus.getCode(), newStatus.getCode());

        // Truncar si excede la longitud máxima
        if (finalDetails.length() > MAX_DETAILS_LENGTH) {
            finalDetails = finalDetails.substring(0, MAX_DETAILS_LENGTH);
        }

        AuditLog auditLog = AuditLog.builder()
                .actor(actorReference)
                .usuarioAfectado(null) // El paquete no es un usuario
                .action(actionCode)
                .details(finalDetails)
                .packageId(pkg.getId())
                .shipmentNumber(pkg.getShipmentNumber())
                .previousStatus(previousStatus != null ? previousStatus.name() : null)
                .newStatus(newStatus != null ? newStatus.name() : null)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(auditLog);
    }
}