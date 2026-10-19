package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Resultado de la carga y previsualización de un archivo de paquetes. */
public record PackageImportPreviewResponse(
        String fileName,
        int totalRecords,
        int validRecordsCount,
        int invalidRecordsCount,
        int duplicateRecordsCount,
        List<ValidPackagePreview> validRecords,
        List<InvalidPackageRecord> invalidRecords,
        List<PackageImportDuplicateResponse> duplicates
) {
    public PackageImportPreviewResponse {
        validRecords = List.copyOf(validRecords);
        invalidRecords = List.copyOf(invalidRecords);
        duplicates = List.copyOf(duplicates);
    }

    /** Los paquetes que se registrarían al confirmar, sin los datos propios de la previsualización. */
    public List<ImportedPackage> importablePackages() {
        return validRecords.stream().map(ValidPackagePreview::packageData).toList();
    }
}
