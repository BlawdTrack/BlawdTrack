package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Registro que no puede importarse junto con todos sus campos faltantes. */
public record InvalidPackageRecord(
        ImportedPackage packageData,
        List<PackageValidationIssue> issues
) {
    public InvalidPackageRecord {
        issues = List.copyOf(issues);
    }
}
