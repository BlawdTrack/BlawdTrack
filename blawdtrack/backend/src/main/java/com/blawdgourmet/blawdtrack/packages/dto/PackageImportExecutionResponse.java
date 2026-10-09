package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Resumen de la validación y persistencia de un archivo importado. */
public record PackageImportExecutionResponse(
        String fileName,
        int totalRecords,
        int registeredRecordsCount,
        int invalidRecordsCount,
        int duplicateRecordsCount,
        List<String> registeredShipmentNumbers
) {
    public PackageImportExecutionResponse {
        registeredShipmentNumbers = List.copyOf(registeredShipmentNumbers);
    }
}
