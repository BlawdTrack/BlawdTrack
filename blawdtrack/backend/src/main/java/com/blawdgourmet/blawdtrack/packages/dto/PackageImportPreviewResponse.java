package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Resultado de la carga y previsualización de un archivo de paquetes. */
public record PackageImportPreviewResponse(
        String fileName,
        int totalRecords,
        int validRecordsCount,
        int invalidRecordsCount,
        int duplicateRecordsCount,
        List<ImportedPackage> validRecords,
        List<InvalidPackageRecord> invalidRecords,
        List<DuplicateShipmentNumberResponse> duplicates
) {
    public PackageImportPreviewResponse {
        validRecords = List.copyOf(validRecords);
        invalidRecords = List.copyOf(invalidRecords);
        duplicates = List.copyOf(duplicates);
    }
}
