package com.blawdgourmet.blawdtrack.packages.service;

import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PackageDeletionServiceImpl implements PackageDeletionService {

    private final DeliveryPackageRepository packages;
    private final AuditService auditService;

    @Override
    @Transactional
    public PackageDeletionResponse deletePackage(String shipmentNumber, AuthenticatedUser actor) {
        // Misma normalización que DeliveryPackage al persistir. Sustituir por
        // ShipmentNumberNormalizer cuando el parser de HU-010 (PR #99) llegue a HU-012.
        String normalizedNumber = shipmentNumber.trim().toUpperCase(Locale.ROOT);

        DeliveryPackage deliveryPackage = packages.findByShipmentNumber(normalizedNumber)
                .orElseThrow(() -> new PackageNotFoundException(normalizedNumber));

        PackageStatus status = deliveryPackage.getStatus();
        if (!status.isDeletable()) {
            throw status == PackageStatus.DELIVERED
                    ? new PackageDeliveredException(normalizedNumber)
                    : new PackageDispatchedException(normalizedNumber, status);
        }

        // La auditoría va primero y en la misma transacción: si falla, el paquete no se elimina.
        auditService.registrarEliminacionPaquete(actor, normalizedNumber, status);
        packages.delete(deliveryPackage);
        packages.flush();

        return new PackageDeletionResponse("Paquete eliminado correctamente.");
    }
}
