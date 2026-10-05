package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDetailResponse;
import com.blawdgourmet.blawdtrack.packages.model.Package;
import com.blawdgourmet.blawdtrack.packages.repository.PackageRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Casos de uso para consultar paquetes/envíos.
 * El acceso está restringido al rol ADMIN_VENTAS (administrador de ventas).
 */
@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;

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
        var pkg = packageRepository.findByShipmentNumber(shipmentNumber)
                .orElseThrow(() -> new PackageNotFoundException(shipmentNumber));

        return mapToDetailResponse(pkg);
    }

    /**
     * Convierte la entidad Package al DTO de respuesta con toda la información.
     */
    private PackageDetailResponse mapToDetailResponse(Package pkg) {
        // Mapear mensajero asignado si existe
        PackageDetailResponse.AssignedCourierInfo assignedCourierInfo = null;
        if (pkg.getAssignedCourier() != null) {
            var courier = pkg.getAssignedCourier();
            var user = courier.getUser();
            assignedCourierInfo = new PackageDetailResponse.AssignedCourierInfo(
                    courier.getId(),
                    user.getId(),
                    user.getDocumentType(),
                    user.getDocumentNumber(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getPhone(),
                    courier.getSchedule(),
                    courier.getMaxPackageWeightKg(),
                    user.getStatus(),
                    user.getRole().getName()
            );
        }

        // Mapear creador (administrador de ventas)
        var creator = pkg.getCreatedBy();
        var createdByInfo = new PackageDetailResponse.CreatedByInfo(
                creator.getId(),
                creator.getDocumentType(),
                creator.getDocumentNumber(),
                creator.getFullName(),
                creator.getEmail(),
                creator.getRole().getName()
        );

        return new PackageDetailResponse(
                pkg.getId(),
                pkg.getShipmentNumber(),
                pkg.getDescription(),
                pkg.getWeightKg(),
                pkg.getLengthCm(),
                pkg.getWidthCm(),
                pkg.getHeightCm(),
                pkg.getStatus(),
                pkg.getCreatedAt(),
                pkg.getUpdatedAt(),
                pkg.getClientName(),
                pkg.getClientDocument(),
                pkg.getClientPhone(),
                pkg.getClientEmail(),
                pkg.getClientAddress(),
                pkg.getDeliveryAddress(),
                pkg.getDeliveryCity(),
                pkg.getDeliveryReference(),
                pkg.getScheduledDeliveryDate(),
                pkg.getActualDeliveryDate(),
                pkg.getDeliveryNotes(),
                pkg.getRecipientSignature(),
                assignedCourierInfo,
                createdByInfo
        );
    }
}