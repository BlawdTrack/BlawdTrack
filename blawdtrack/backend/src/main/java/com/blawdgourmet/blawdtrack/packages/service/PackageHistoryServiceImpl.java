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

/**
 * Implementación del servicio de historial de paquetes.
 * Utiliza la tabla de auditoría para reconstruir la línea de tiempo.
 */
@Service
@RequiredArgsConstructor
public class PackageHistoryServiceImpl implements PackageHistoryService {

    private static final Collection<String> PACKAGE_ACTIONS = List.of(
            AuditAction.PACKAGE_STATUS_CHANGED.getCode(),
            AuditAction.PACKAGE_ASSIGNED.getCode(),
            AuditAction.PACKAGE_UNASSIGNED.getCode()
    );

    private final AuditLogRepository auditLogRepository;
    private final DeliveryPackageRepository packageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PackageHistoryEntry> getHistoryByShipmentNumber(String shipmentNumber) {
        String normalizedShipmentNumber = ShipmentNumberNormalizer.normalize(shipmentNumber);

        // Verificar que el paquete existe
        packageRepository.findByShipmentNumber(normalizedShipmentNumber)
                .orElseThrow(() -> new PackageNotFoundException(shipmentNumber));

        // Buscar registros de auditoría relacionados con el paquete
        // Nota: El detalle de la auditoría contiene el número de envío
        List<AuditLog> logs = auditLogRepository.findByActionInOrderByTimestampDesc(PACKAGE_ACTIONS);

        // Filtrar los que pertenecen a este paquete y mapear a DTO
        return logs.stream()
                .filter(log -> log.getDetails() != null && log.getDetails().contains(normalizedShipmentNumber))
                .map(PackageHistoryEntry::from)
                .sorted((a, b) -> a.timestamp().compareTo(b.timestamp())) // Orden cronológico ascendente
                .toList();
    }
}