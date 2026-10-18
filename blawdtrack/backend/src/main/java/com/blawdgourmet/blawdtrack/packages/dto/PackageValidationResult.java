package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Clasificación completa de un lote sin descartar los registros inválidos. */
public record PackageValidationResult(
        List<ImportedPackage> validRecords,
        List<InvalidPackageRecord> invalidRecords
) {
    public PackageValidationResult {
        validRecords = List.copyOf(validRecords);
        invalidRecords = List.copyOf(invalidRecords);
    }
}
