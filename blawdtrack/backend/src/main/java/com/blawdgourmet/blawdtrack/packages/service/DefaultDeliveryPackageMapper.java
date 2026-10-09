package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DefaultDeliveryPackageMapper implements DeliveryPackageMapper {

    private final DeliveryWindowPolicy deliveryWindowPolicy;

    @Override
    public DeliveryPackage toEntity(ImportedPackage packageData) {
        if (packageData == null) {
            throw new IllegalArgumentException("El paquete a registrar es obligatorio");
        }
        DeliveryWindow window = deliveryWindowPolicy.calculate(packageData.schedule());
        return DeliveryPackage.builder()
                .shipmentNumber(ShipmentNumberNormalizer.normalize(packageData.shipmentNumber()))
                .orderNumber(packageData.orderNumber())
                .customerName(packageData.customerName())
                .address(packageData.address())
                .phone(packageData.phone())
                .schedule(packageData.schedule())
                .status(PackageStatus.PENDING)
                .deliveryStartTime(window.start())
                .deliveryEndTime(window.end())
                .build();
    }
}
