package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.PackageDetailResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageHistoryEntry;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import lombok.RequiredArgsConstructor;

/**
 * Casos de uso para consultar paquetes/envíos.
 * El acceso está restringido al rol ADMIN_VENTAS (administrador de ventas).
 */
@Service
@RequiredArgsConstructor
public class PackageService {

    private final DeliveryPackageRepository packageRepository;
    private final PackageHistoryService historyService;

    /**
     * Obtiene el detalle completo de un paquete por su número de envío.
     *
     * @param shipmentNumber número de envío del paquete
     * @return detalle completo del paquete
     * @throws PackageNotFoundException si no existe un paquete con ese número de envío
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public PackageDetailResponse getPackageByShipmentNumber(String shipmentNumber) {
        String normalizedShipmentNumber = ShipmentNumberNormalizer.normalize(shipmentNumber);
        var pkg = packageRepository.findByShipmentNumber(normalizedShipmentNumber)
                .orElseThrow(() -> new PackageNotFoundException(shipmentNumber));

        return mapToDetailResponse(pkg);
    }

    /**
     * Obtiene el historial cronológico de cambios de estado de un paquete.
     *
     * @param shipmentNumber número de envío del paquete
     * @return lista ordenada cronológicamente (más antiguo primero)
     * @throws PackageNotFoundException si no existe un paquete con ese número de envío
     */
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SALES_ADMIN + "')")
    public List<PackageHistoryEntry> getPackageHistory(String shipmentNumber) {
        return historyService.getHistoryByShipmentNumber(shipmentNumber);
    }

    /**
     * Convierte la entidad DeliveryPackage al DTO de respuesta.
     */
    private PackageDetailResponse mapToDetailResponse(DeliveryPackage pkg) {
        PackageDetailResponse.AssignedCourierInfo assignedCourierInfo = null;
        if (pkg.getAssignedCourier() != null) {
            var courier = pkg.getAssignedCourier();
            var user = courier.getUser();
            assignedCourierInfo = new PackageDetailResponse.AssignedCourierInfo(
                    courier.getId(),
                    user.getFullName(),
                    user.getPhone(),
                    courier.getSchedule()
            );
        }

        return new PackageDetailResponse(
                pkg.getId(),
                pkg.getShipmentNumber(),
                pkg.getOrderNumber(),
                pkg.getCustomerName(),
                pkg.getPhone(),
                pkg.getAddress(),
                pkg.getSchedule(),
                pkg.getStatus(),
                pkg.getItems().stream()
                        .map(item -> new PackageDetailResponse.PackageItemInfo(
                                item.getItemId(),
                                item.getName(),
                                item.getQuantity(),
                                item.getSku(),
                                item.getUnitPrice()))
                        .toList(),
                assignedCourierInfo
        );
    }
}