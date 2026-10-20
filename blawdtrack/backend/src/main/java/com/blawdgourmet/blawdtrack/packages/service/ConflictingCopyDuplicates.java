package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportDuplicateResponse;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * Suma a los duplicados de la previsualización las copias de un número de envío que el archivo trae con datos
 * contradictorios (HU-011). Se conserva el primer paquete; cada copia posterior es una fila duplicada en el archivo.
 */
@Component
public class ConflictingCopyDuplicates {

    public List<PackageImportDuplicateResponse> addTo(
            List<PackageImportDuplicateResponse> duplicates, List<ImportedPackage> conflictingCopies) {
        if (conflictingCopies.isEmpty()) {
            return duplicates;
        }
        Map<String, PackageImportDuplicateResponse> byShipmentNumber = new LinkedHashMap<>();
        duplicates.forEach(duplicate -> byShipmentNumber.put(duplicate.shipmentNumber(), duplicate));

        conflictingCopies.stream()
                .collect(Collectors.groupingBy(
                        ImportedPackage::shipmentNumber, LinkedHashMap::new, Collectors.counting()))
                .forEach((shipmentNumber, copies) -> byShipmentNumber.merge(
                        shipmentNumber,
                        new PackageImportDuplicateResponse(
                                shipmentNumber,
                                copies.intValue(),
                                List.of(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE)),
                        this::combine));
        return List.copyOf(byShipmentNumber.values());
    }

    private PackageImportDuplicateResponse combine(
            PackageImportDuplicateResponse existing, PackageImportDuplicateResponse added) {
        List<DuplicateShipmentNumberReason> reasons = new ArrayList<>(existing.reasons());
        if (!reasons.contains(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE)) {
            reasons.add(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        }
        return new PackageImportDuplicateResponse(
                existing.shipmentNumber(), existing.occurrences() + added.occurrences(), reasons);
    }
}
