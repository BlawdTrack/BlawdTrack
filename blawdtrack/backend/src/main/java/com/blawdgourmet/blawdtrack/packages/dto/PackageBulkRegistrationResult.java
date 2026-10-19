package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/** Resultado estable del servicio de persistencia masiva. */
public record PackageBulkRegistrationResult(
        int registeredCount,
        List<String> registeredShipmentNumbers
) {
    public PackageBulkRegistrationResult {
        registeredShipmentNumbers = List.copyOf(registeredShipmentNumbers);
    }
}
