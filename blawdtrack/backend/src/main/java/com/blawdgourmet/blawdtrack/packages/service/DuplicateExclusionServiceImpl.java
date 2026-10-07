package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateExclusionResult;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DuplicateExclusionServiceImpl implements DuplicateExclusionService {

    private final ShipmentNumberComparisonService comparisonService;

    @Override
    public <T> DuplicateExclusionResult<T> excludeDuplicates(
            List<T> rows, Function<T, String> shipmentNumberOf) {
        if (rows.isEmpty()) {
            return new DuplicateExclusionResult<>(
                    List.of(), new ShipmentNumberComparisonResponse(0, 0, 0, 0, 0, List.of()));
        }

        ShipmentNumberComparisonResponse report =
                comparisonService.compare(rows.stream().map(shipmentNumberOf).toList());

        List<T> importable = new ArrayList<>(report.validCount());
        for (int index = 0; index < rows.size(); index++) {
            if (report.rows().get(index).reasons().isEmpty()) {
                importable.add(rows.get(index));
            }
        }
        return new DuplicateExclusionResult<>(List.copyOf(importable), report);
    }
}
