package com.blawdgourmet.blawdtrack.packages.dto;

import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;

import java.math.BigDecimal;
import java.util.List;

/**
 * Respuesta con los datos de importación y el mensajero asignado.
 */
public record PackageDetailResponse(
        Long id,
        String shipmentNumber,
        String orderNumber,
        String customerName,
        String phone,
        String address,
        String schedule,
        PackageStatus status,
        String deliveryEvidenceUrl,
        String deliverySignatureUrl,
        String deliveryPhotoUrl,
        List<PackageItemInfo> items,
        AssignedCourierInfo assignedCourier
) {

    public PackageDetailResponse {
        items = List.copyOf(items);
    }

    public record PackageItemInfo(
            String itemId,
            String name,
            BigDecimal quantity,
            String sku,
            BigDecimal unitPrice
    ) {}

    /**
     * Información mínima necesaria para identificar y contactar al mensajero.
     */
    public record AssignedCourierInfo(
            Long courierId,
            String fullName,
            String phone,
            String schedule
    ) {}
}
