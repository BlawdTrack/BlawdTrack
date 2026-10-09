package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageBulkRegistrationResult;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Persiste atómicamente paquetes previamente validados y libres de duplicados. */
@Service
@RequiredArgsConstructor
public class PackageBulkRegistrationService implements PackageBulkRegistrationUseCase {

    private final DeliveryPackageRepository packageRepository;
    private final DeliveryPackageMapper packageMapper;

    @Override
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public PackageBulkRegistrationResult registerValidPackages(List<ImportedPackage> validPackages) {
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
        List<String> shipmentNumbers = savedPackages.stream()
                .map(DeliveryPackage::getShipmentNumber)
                .toList();

        return new PackageBulkRegistrationResult(savedPackages.size(), shipmentNumbers);
    }
}
