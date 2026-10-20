package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageBulkRegistrationResult;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.PermissionCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persiste atómicamente paquetes previamente validados y libres de duplicados, y deja el alta de cada uno como
 * primer evento de su línea de tiempo (HU-013) en la misma transacción.
 */
@Service
@RequiredArgsConstructor
public class PackageBulkRegistrationService implements PackageBulkRegistrationUseCase {

    private final DeliveryPackageRepository packageRepository;
    private final DeliveryPackageMapper packageMapper;
    private final PackageCreationAuditService creationAudit;

    @Override
    @Transactional
    @PreAuthorize("hasAuthority('" + PermissionCode.PACKAGE_IMPORT + "')")
    public PackageBulkRegistrationResult registerValidPackages(
            List<ImportedPackage> validPackages, AuthenticatedUser actor) {
        if (validPackages == null) {
            throw new IllegalArgumentException("La lista de paquetes válidos es obligatoria");
        }
        if (validPackages.isEmpty()) {
            return new PackageBulkRegistrationResult(0, List.of());
        }

        List<DeliveryPackage> entities = validPackages.stream()
                .map(packageMapper::toEntity)
                .toList();
        List<DeliveryPackage> savedPackages = packageRepository.saveAllAndFlush(entities);
        creationAudit.registerCreations(actor, savedPackages);
        List<String> shipmentNumbers = savedPackages.stream()
                .map(DeliveryPackage::getShipmentNumber)
                .toList();

        return new PackageBulkRegistrationResult(savedPackages.size(), shipmentNumbers);
    }
}
