package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.InvalidPackageRecord;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationIssue;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationResult;
import com.blawdgourmet.blawdtrack.packages.validation.PackageRecordValidator;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** Orquesta reglas independientes sin detener el lote al encontrar errores. */
@Service
@RequiredArgsConstructor
public class PackageRecordValidationServiceImpl implements PackageRecordValidationService {

    private final List<PackageRecordValidator> validators;
    private final DeliverySchedulePolicy schedulePolicy;

    @Override
    public PackageValidationResult validate(List<ImportedPackage> packageRecords) {
        if (packageRecords == null) {
            throw new IllegalArgumentException("La lista de paquetes es obligatoria");
        }

        List<ImportedPackage> validRecords = new ArrayList<>();
        List<InvalidPackageRecord> invalidRecords = new ArrayList<>();

        for (ImportedPackage packageRecord : packageRecords) {
            ImportedPackage completedRecord = schedulePolicy.apply(packageRecord);
            List<PackageValidationIssue> issues = validators.stream()
                    .flatMap(validator -> validator.validate(completedRecord).stream())
                    .toList();

            if (issues.isEmpty()) {
                validRecords.add(completedRecord);
            } else {
                invalidRecords.add(new InvalidPackageRecord(completedRecord, issues));
            }
        }

        return new PackageValidationResult(validRecords, invalidRecords);
    }
}
