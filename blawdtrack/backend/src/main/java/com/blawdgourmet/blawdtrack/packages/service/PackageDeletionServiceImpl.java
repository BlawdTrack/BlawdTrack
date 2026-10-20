package com.blawdgourmet.blawdtrack.packages.service;


import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PackageDeletionServiceImpl implements PackageDeletionService {

    private final DeliveryPackageRepository packages;
    private final PackageDeletionAuditService deletionAudit;

    @Override
    @Transactional
    public PackageDeletionResponse deletePackage(String shipmentNumber, AuthenticatedUser actor) {
        String normalizedNumber = ShipmentNumberNormalizer.normalize(shipmentNumber);

        DeliveryPackage deliveryPackage = packages.findByShipmentNumber(normalizedNumber)
                .orElseThrow(() -> new PackageNotFoundException(normalizedNumber));

        PackageStatus status = deliveryPackage.getStatus();
        if (!status.isDeletable()) {
            throw status == PackageStatus.DELIVERED
                    ? new PackageDeliveredException(normalizedNumber)
                    : new PackageDispatchedException(normalizedNumber, status);
        }

        // El DELETE se ejecuta primero (flush) para auditar solo un borrado que realmente ocurrió.
        // La auditoría va en la misma transacción: si falla, se revierte el borrado.
        packages.delete(deliveryPackage);
        packages.flush();
        deletionAudit.registerDeletion(actor, normalizedNumber, status);

        return new PackageDeletionResponse("Paquete eliminado correctamente.");
    }
}
