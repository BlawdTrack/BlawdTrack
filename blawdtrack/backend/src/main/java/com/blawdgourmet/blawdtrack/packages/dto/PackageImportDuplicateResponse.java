package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Resumen por número de envío de las filas excluidas por duplicidad. */
public record PackageImportDuplicateResponse(
        String shipmentNumber,
        int occurrences,
        List<DuplicateShipmentNumberReason> reasons) {

    public PackageImportDuplicateResponse {
        reasons = List.copyOf(reasons);
    }
}
