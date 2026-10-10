package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationResult;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.parser.PackageFileParser;
import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Orquesta la extracción, validación y detección de duplicados. */
@Service
@RequiredArgsConstructor
public class PackageImportPreviewService implements PackageImportPreviewUseCase {

    private final PackageFileParser fileParser;
    private final PackageRecordValidationService recordValidationService;
    private final ShipmentNumberComparisonService comparisonService;

    @Override
    public PackageImportPreviewResponse preview(InputStream input, String fileName) {
        List<ImportedPackage> parsedRecords = fileParser.parse(input, fileName);
        PackageValidationResult validation = recordValidationService.validate(parsedRecords);

        List<String> shipmentNumbers = validation.validRecords().stream()
                .map(ImportedPackage::shipmentNumber)
                .toList();
        ShipmentNumberComparisonResponse comparison = shipmentNumbers.isEmpty()
                ? new ShipmentNumberComparisonResponse(0, 0, List.of(), List.of())
                : comparisonService.compare(shipmentNumbers);
        Set<String> importableNumbers =
                new HashSet<>(comparison.importableShipmentNumbers());
        List<ImportedPackage> importableRecords = validation.validRecords().stream()
                .filter(record -> importableNumbers.contains(record.shipmentNumber()))
                .toList();

        return new PackageImportPreviewResponse(
                fileName,
                parsedRecords.size(),
                importableRecords.size(),
                validation.invalidRecords().size(),
                comparison.duplicates().size(),
                importableRecords,
                validation.invalidRecords(),
                comparison.duplicates()
        );
    }
}
