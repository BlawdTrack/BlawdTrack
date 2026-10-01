package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

public record ImportedPackage(
        String shipmentNumber,
        String orderNumber,
        String customerName,
        String address,
        String phone,
        String schedule,
        List<ImportedPackageItem> items
) {
    public ImportedPackage {
        items = List.copyOf(items);
    }
}
