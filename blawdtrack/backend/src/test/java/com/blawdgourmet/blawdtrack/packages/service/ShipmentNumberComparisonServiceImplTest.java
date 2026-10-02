package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.DuplicateShipmentNumberReason;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ShipmentNumberComparisonServiceImplTest {

    private final DeliveryPackageRepository repository = mock(DeliveryPackageRepository.class);
    private final ShipmentNumberComparisonService service =
            new ShipmentNumberComparisonServiceImpl(repository);

    @Test
    void clasificaEnUnaSolaConsultaDisponiblesDuplicadosDelArchivoYRegistrados() {
        Set<String> normalizedNumbers = new LinkedHashSet<>(
                List.of("ENV-00953", "ENV-00956", "ENV-00958"));
        when(repository.findExistingShipmentNumbers(normalizedNumbers))
                .thenReturn(Set.of("ENV-00953"));

        var result = service.compare(List.of(
                " env-00953 ", "ENV-00956", "env-00956", "ENV-00958"));

        assertThat(result.receivedCount()).isEqualTo(4);
        assertThat(result.distinctCount()).isEqualTo(3);
        assertThat(result.importableShipmentNumbers()).containsExactly("ENV-00958");
        assertThat(result.duplicates()).hasSize(2);
        assertThat(result.duplicates().get(0).shipmentNumber()).isEqualTo("ENV-00953");
        assertThat(result.duplicates().get(0).occurrences()).isEqualTo(1);
        assertThat(result.duplicates().get(0).reasons())
                .containsExactly(DuplicateShipmentNumberReason.ALREADY_REGISTERED);
        assertThat(result.duplicates().get(1).shipmentNumber()).isEqualTo("ENV-00956");
        assertThat(result.duplicates().get(1).occurrences()).isEqualTo(2);
        assertThat(result.duplicates().get(1).reasons())
                .containsExactly(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        verify(repository).findExistingShipmentNumbers(normalizedNumbers);
    }

    @Test
    void informaLasDosCausasCuandoElNumeroEstaRepetidoYRegistrado() {
        when(repository.findExistingShipmentNumbers(Set.of("ENV-00953")))
                .thenReturn(Set.of("ENV-00953"));

        var result = service.compare(List.of("ENV-00953", "env-00953"));

        assertThat(result.importableShipmentNumbers()).isEmpty();
        assertThat(result.duplicates()).singleElement().satisfies(duplicate -> {
            assertThat(duplicate.shipmentNumber()).isEqualTo("ENV-00953");
            assertThat(duplicate.occurrences()).isEqualTo(2);
            assertThat(duplicate.reasons()).containsExactly(
                    DuplicateShipmentNumberReason.ALREADY_REGISTERED,
                    DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        });
    }
}
