package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateExclusionResult;
import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.PackageValidationResult;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberComparisonResponse;
import com.blawdgourmet.blawdtrack.packages.dto.ShipmentNumberRowResult;
import com.blawdgourmet.blawdtrack.packages.dto.ValidPackagePreview;
import com.blawdgourmet.blawdtrack.packages.parser.PackageFileParser;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class PackageImportPreviewServiceImplTest {

    private final PackageFileParser parser = mock(PackageFileParser.class);
    private final PackageRecordValidationService validationService =
            mock(PackageRecordValidationService.class);
    private final DuplicateExclusionService exclusionService =
            mock(DuplicateExclusionService.class);
    private final PackageImportPreviewService service = new PackageImportPreviewServiceImpl(
            parser, validationService, exclusionService, new ZohoDeliveryWindowPolicy());

    @Test
    void cuentaFilasDuplicadasYNoSoloGrupos() {
        InputStream input = new ByteArrayInputStream(new byte[] {1});
        ImportedPackage first = packageWithShipmentNumber("ENV-REPETIDO");
        ImportedPackage second = packageWithShipmentNumber("ENV-REPETIDO");
        List<ImportedPackage> parsed = List.of(first, second);
        List<DuplicateShipmentNumberReason> reasons =
                List.of(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        ShipmentNumberComparisonResponse report = new ShipmentNumberComparisonResponse(
                2,
                0,
                2,
                0,
                2,
                List.of(
                        new ShipmentNumberRowResult(1, "ENV-REPETIDO", reasons, List.of(2)),
                        new ShipmentNumberRowResult(2, "ENV-REPETIDO", reasons, List.of(1))));

        when(parser.parse(input, "repetidos.csv")).thenReturn(parsed);
        when(validationService.validate(parsed))
                .thenReturn(new PackageValidationResult(parsed, List.of()));
        when(exclusionService.excludeDuplicates(eq(parsed), any()))
                .thenReturn(new DuplicateExclusionResult<>(List.of(), report));

        var preview = service.preview(input, "repetidos.csv");

        assertThat(preview.totalRecords()).isEqualTo(2);
        assertThat(preview.validRecordsCount()).isZero();
        assertThat(preview.invalidRecordsCount()).isZero();
        assertThat(preview.duplicateRecordsCount()).isEqualTo(2);
        assertThat(preview.validRecordsCount()
                + preview.invalidRecordsCount()
                + preview.duplicateRecordsCount()).isEqualTo(preview.totalRecords());
        assertThat(preview.duplicates()).singleElement().satisfies(duplicate -> {
            assertThat(duplicate.shipmentNumber()).isEqualTo("ENV-REPETIDO");
            assertThat(duplicate.occurrences()).isEqualTo(2);
            assertThat(duplicate.reasons())
                    .containsExactly(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        });
    }

    @Test
    void cadaPaqueteValidoTraeElRangoDeEntregaSegunSuHorario() {
        InputStream input = new ByteArrayInputStream(new byte[] {1});
        ImportedPackage sinHorario = packageWithSchedule("ENV-1", null);
        ImportedPackage antes = packageWithSchedule("ENV-2", "Antes de las 3 p.m.");
        ImportedPackage despues = packageWithSchedule("ENV-3", "Después de las dos de la tarde");
        List<ImportedPackage> parsed = List.of(sinHorario, antes, despues);
        ShipmentNumberComparisonResponse report = new ShipmentNumberComparisonResponse(3, 3, 0, 0, 0, List.of());

        when(parser.parse(input, "paquetes.csv")).thenReturn(parsed);
        when(validationService.validate(parsed))
                .thenReturn(new PackageValidationResult(parsed, List.of()));
        when(exclusionService.excludeDuplicates(eq(parsed), any()))
                .thenReturn(new DuplicateExclusionResult<>(parsed, report));

        var preview = service.preview(input, "paquetes.csv");

        assertThat(preview.validRecords()).extracting(ValidPackagePreview::deliveryWindow).containsExactly(
                new DeliveryWindow(LocalTime.of(9, 0), LocalTime.of(16, 0)),
                new DeliveryWindow(LocalTime.of(9, 0), LocalTime.of(14, 0)),
                new DeliveryWindow(LocalTime.of(14, 0), LocalTime.of(16, 0)));
        assertThat(preview.importablePackages()).containsExactlyElementsOf(parsed);
    }

    private ImportedPackage packageWithShipmentNumber(String shipmentNumber) {
        return packageWithSchedule(shipmentNumber, null);
    }

    private ImportedPackage packageWithSchedule(String shipmentNumber, String schedule) {
        return new ImportedPackage(
                shipmentNumber,
                "SO-1",
                "Cliente",
                "San Jose",
                "8888-8888",
                schedule,
                List.of());
    }
}
