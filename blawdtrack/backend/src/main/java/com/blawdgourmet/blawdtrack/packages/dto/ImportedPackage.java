package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Paquete importado y agrupado desde un archivo de Zoho (HU010, task 263). */
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
