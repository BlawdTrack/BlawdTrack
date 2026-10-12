package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import java.util.List;

public interface ShipmentNumberComparisonService {
    ShipmentNumberComparisonResponse compare(List<String> shipmentNumbers);
}
