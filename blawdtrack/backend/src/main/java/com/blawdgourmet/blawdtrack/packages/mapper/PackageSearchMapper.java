package com.blawdgourmet.blawdtrack.packages.mapper;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

@Component
public class PackageSearchMapper {

    public PackageSearchResponse toResponse(DeliveryPackage entity) {
        return new PackageSearchResponse(entity.getId(), entity.getShipmentNumber(), entity.getOrderNumber(),
                entity.getCustomerName(), entity.getAddress(), entity.getPhone(), entity.getSchedule());
    }
}