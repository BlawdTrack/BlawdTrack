package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

public record ShipmentNumberComparisonResponse(
        int receivedCount,
        int distinctCount,
        List<String> importableShipmentNumbers,
        List<DuplicateShipmentNumberResponse> duplicates) {
}
