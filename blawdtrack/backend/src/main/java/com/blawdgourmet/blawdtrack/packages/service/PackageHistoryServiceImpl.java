package com.blawdgourmet.blawdtrack.packages.service;

import java.util.Collection;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.model.AuditLog;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.packages.dto.PackageHistoryEntry;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PackageHistoryServiceImpl implements PackageHistoryService {

    private static final Collection<String> PACKAGE_ACTIONS = List.of(
            AuditAction.PACKAGE_STATUS_CHANGED.getCode(),
            AuditAction.PACKAGE_ASSIGNED.getCode(),
            AuditAction.PACKAGE_UNASSIGNED.getCode());

    private final AuditLogRepository auditLogRepository;
    private final DeliveryPackageRepository packageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PackageHistoryEntry> getHistoryByShipmentNumber(String shipmentNumber) {
        String normalizedShipmentNumber = ShipmentNumberNormalizer.normalize(shipmentNumber);
        var pkg = packageRepository.findByShipmentNumber(normalizedShipmentNumber)
                .orElseThrow(() -> new PackageNotFoundException(shipmentNumber));

        List<AuditLog> logs = auditLogRepository.findByPackageIdAndActionInOrderByTimestampAscIdAsc(
                pkg.getId(), PACKAGE_ACTIONS);

        return logs.stream()
                .map(PackageHistoryEntry::from)
                .toList();
    }
}
