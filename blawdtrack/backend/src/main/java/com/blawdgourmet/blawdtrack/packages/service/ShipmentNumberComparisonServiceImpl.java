package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberRowResult;
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
        List<String> normalized = shipmentNumbers.stream().map(this::normalize).toList();

        Map<String, List<Integer>> rowsByNumber = new LinkedHashMap<>();
        for (int index = 0; index < normalized.size(); index++) {
            rowsByNumber.computeIfAbsent(normalized.get(index), number -> new ArrayList<>())
                    .add(index + 1);
        }

        Set<String> existing = packageRepository.findExistingShipmentNumbers(rowsByNumber.keySet());

        List<ShipmentNumberRowResult> rows = new ArrayList<>(normalized.size());
        for (int index = 0; index < normalized.size(); index++) {
            rows.add(classify(index + 1, normalized.get(index), rowsByNumber, existing));
        }

        return summarize(rows);
    }

    private ShipmentNumberRowResult classify(int row, String number,
            Map<String, List<Integer>> rowsByNumber, Set<String> existing) {
        List<Integer> sameNumberRows = rowsByNumber.get(number);
        List<DuplicateShipmentNumberReason> reasons = new ArrayList<>(2);
        if (existing.contains(number)) {
            reasons.add(DuplicateShipmentNumberReason.ALREADY_REGISTERED);
        }
        if (sameNumberRows.size() > 1) {
            reasons.add(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        }
        List<Integer> repeatedInRows = sameNumberRows.stream()
                .filter(other -> other != row)
                .toList();
        return new ShipmentNumberRowResult(row, number, List.copyOf(reasons), repeatedInRows);
    }

    private ShipmentNumberComparisonResponse summarize(List<ShipmentNumberRowResult> rows) {
        int alreadyRegistered = 0;
        int duplicatedInFile = 0;
        int valid = 0;
        for (ShipmentNumberRowResult result : rows) {
            if (result.reasons().contains(DuplicateShipmentNumberReason.ALREADY_REGISTERED)) {
                alreadyRegistered++;
            } else if (result.reasons().contains(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE)) {
                duplicatedInFile++;
            } else {
                valid++;
            }
        }
        return new ShipmentNumberComparisonResponse(rows.size(), valid,
                alreadyRegistered + duplicatedInFile, alreadyRegistered, duplicatedInFile,
                List.copyOf(rows));
    }

    private String normalize(String shipmentNumber) {
        return shipmentNumber.trim().toUpperCase(Locale.ROOT);
    }
}
