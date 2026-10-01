package com.blawdgourmet.blawdtrack.packages.dto;

import java.math.BigDecimal;

public record ImportedPackageItem(
        String itemId,
        String name,
        BigDecimal quantity,
        String sku,
        BigDecimal unitPrice
) {
}
