package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageImportDuplicateResponse;
import java.util.List;
import org.junit.jupiter.api.Test;

class ConflictingCopyDuplicatesTest {

    private final ConflictingCopyDuplicates conflictingCopies = new ConflictingCopyDuplicates();

    @Test
    void sinCopiasDevuelveLosDuplicadosTalCual() {
        List<PackageImportDuplicateResponse> existing = List.of(
                new PackageImportDuplicateResponse(
                        "ENV-1", 1, List.of(DuplicateShipmentNumberReason.ALREADY_REGISTERED)));

        assertThat(conflictingCopies.addTo(existing, List.of())).isEqualTo(existing);
    }

    @Test
    void agregaUnaEntradaPorNumeroConLaCantidadDeCopias() {
        var result = conflictingCopies.addTo(List.of(), List.of(copyOf("ENV-1"), copyOf("ENV-1"), copyOf("ENV-2")));

        assertThat(result)
                .extracting(PackageImportDuplicateResponse::shipmentNumber, PackageImportDuplicateResponse::occurrences)
                .containsExactly(tuple("ENV-1", 2), tuple("ENV-2", 1));
        assertThat(result).allSatisfy(duplicate ->
                assertThat(duplicate.reasons()).containsExactly(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE));
    }

    @Test
    void siElNumeroYaEstabaRegistradoSumaLaCausaYLasFilas() {
        List<PackageImportDuplicateResponse> existing = List.of(
                new PackageImportDuplicateResponse(
                        "ENV-1", 1, List.of(DuplicateShipmentNumberReason.ALREADY_REGISTERED)));

        var result = conflictingCopies.addTo(existing, List.of(copyOf("ENV-1")));

        assertThat(result).singleElement().satisfies(duplicate -> {
            assertThat(duplicate.occurrences()).isEqualTo(2);
            assertThat(duplicate.reasons()).containsExactly(
                    DuplicateShipmentNumberReason.ALREADY_REGISTERED, DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        });
    }

    private static ImportedPackage copyOf(String shipmentNumber) {
        return new ImportedPackage(shipmentNumber, "SO-9", "Cliente", "San Jose", "8888-8888", null, List.of());
    }
}
