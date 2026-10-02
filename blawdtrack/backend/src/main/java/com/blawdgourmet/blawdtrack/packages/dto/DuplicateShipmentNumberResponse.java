package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

public record DuplicateShipmentNumberResponse(
        String shipmentNumber,
        int occurrences,
        List<DuplicateShipmentNumberReason> reasons) {
}
