package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberResponse;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ShipmentNumberComparisonServiceImpl implements ShipmentNumberComparisonService {

    private final DeliveryPackageRepository packageRepository;

    @Override
    @Transactional(readOnly = true)
    public ShipmentNumberComparisonResponse compare(List<String> shipmentNumbers) {
        Map<String, Integer> occurrences = new LinkedHashMap<>();
        shipmentNumbers.stream()
                .map(this::normalize)
                .forEach(number -> occurrences.merge(number, 1, Integer::sum));

        Set<String> existing = packageRepository.findExistingShipmentNumbers(occurrences.keySet());
        List<String> importable = new ArrayList<>();
        List<DuplicateShipmentNumberResponse> duplicates = new ArrayList<>();

        occurrences.forEach((number, count) -> {
            List<DuplicateShipmentNumberReason> reasons = new ArrayList<>(2);
            if (existing.contains(number)) {
                reasons.add(DuplicateShipmentNumberReason.ALREADY_REGISTERED);
            }
            if (count > 1) {
                reasons.add(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
            }

            if (reasons.isEmpty()) {
                importable.add(number);
            } else {
                duplicates.add(new DuplicateShipmentNumberResponse(number, count, List.copyOf(reasons)));
            }
        });

        return new ShipmentNumberComparisonResponse(
                shipmentNumbers.size(), occurrences.size(), List.copyOf(importable), List.copyOf(duplicates));
    }

    private String normalize(String shipmentNumber) {
        return shipmentNumber.trim().toUpperCase(Locale.ROOT);
    }
}
