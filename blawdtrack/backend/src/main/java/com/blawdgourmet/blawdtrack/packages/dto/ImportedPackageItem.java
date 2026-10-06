package com.blawdgourmet.blawdtrack.packages.dto;

import java.math.BigDecimal;

/** Artículo perteneciente a un paquete importado de Zoho (HU010, task 263). */
public record ImportedPackageItem(
        String itemId,
        String name,
        BigDecimal quantity,
        String sku,
        BigDecimal unitPrice
) {
}
