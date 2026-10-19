package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateExclusionResult;
import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportDuplicateResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportPreviewResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationResult;
import com.blawdgourmet.blawdtrack.packages.dto.ParsedPackageFile;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberRowResult;
import com.blawdgourmet.blawdtrack.packages.dto.ValidPackagePreview;
import com.blawdgourmet.blawdtrack.packages.parser.PackageFileParser;
import java.io.InputStream;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Orquesta la extracción, validación y exclusión de duplicados de la previsualización. */
@Service
@RequiredArgsConstructor
public class PackageImportPreviewServiceImpl implements PackageImportPreviewService {

    private final PackageFileParser fileParser;
    private final PackageRecordValidationService recordValidationService;
    private final DuplicateExclusionService duplicateExclusionService;
    private final DeliveryWindowPolicy deliveryWindowPolicy;
    private final ConflictingCopyDuplicates conflictingCopyDuplicates;

    @Override
    public PackageImportPreviewResponse preview(InputStream input, String fileName) {
        ParsedPackageFile file = fileParser.parseFile(input, fileName);
        List<ImportedPackage> parsedRecords = file.packages();
        int conflictingCopies = file.conflictingCopies().size();
        PackageValidationResult validation = recordValidationService.validate(parsedRecords);
        DuplicateExclusionResult<ImportedPackage> exclusion =
                duplicateExclusionService.excludeDuplicates(
                        validation.validRecords(), ImportedPackage::shipmentNumber);
        ShipmentNumberComparisonResponse report = exclusion.report();

        return new PackageImportPreviewResponse(
                fileName,
                parsedRecords.size() + conflictingCopies,
                exclusion.importable().size(),
                validation.invalidRecords().size(),
                report.duplicateCount() + conflictingCopies,
                withDeliveryWindow(exclusion.importable()),
                validation.invalidRecords(),
                conflictingCopyDuplicates.addTo(summarizeDuplicates(report), file.conflictingCopies())
        );
    }

    private List<ValidPackagePreview> withDeliveryWindow(List<ImportedPackage> importable) {
        return importable.stream()
                .map(record -> new ValidPackagePreview(record, deliveryWindowPolicy.calculate(record.schedule())))
                .toList();
    }

    private List<PackageImportDuplicateResponse> summarizeDuplicates(
            ShipmentNumberComparisonResponse report) {
        Map<String, List<ShipmentNumberRowResult>> rowsByShipmentNumber = report.rows().stream()
                .filter(row -> !row.reasons().isEmpty())
                .collect(Collectors.groupingBy(
                        ShipmentNumberRowResult::shipmentNumber,
                        LinkedHashMap::new,
                        Collectors.toList()));

        return rowsByShipmentNumber.entrySet().stream()
                .map(entry -> new PackageImportDuplicateResponse(
                        entry.getKey(),
                        entry.getValue().size(),
                        reasonsOf(entry.getValue())))
                .toList();
    }

    private List<DuplicateShipmentNumberReason> reasonsOf(
            List<ShipmentNumberRowResult> rows) {
        return Arrays.stream(DuplicateShipmentNumberReason.values())
                .filter(reason -> rows.stream().anyMatch(row -> row.reasons().contains(reason)))
                .toList();
    }
}
