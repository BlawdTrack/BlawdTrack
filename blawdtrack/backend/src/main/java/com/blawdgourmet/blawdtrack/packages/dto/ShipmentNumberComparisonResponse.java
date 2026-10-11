package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/**
 * Los contadores son excluyentes: una fila ya registrada en la base de datos cuenta solo en
 * {@code alreadyRegisteredCount}, aunque además esté repetida en el archivo, de modo que
 * {@code totalRows = validCount + alreadyRegisteredCount + duplicatedInFileCount}.
 */
public record ShipmentNumberComparisonResponse(
        int totalRows,
        int validCount,
        int duplicateCount,
        int alreadyRegisteredCount,
        int duplicatedInFileCount,
        List<ShipmentNumberRowResult> rows) {
}
