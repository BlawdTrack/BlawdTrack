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
    void clasificaEnUnaSolaConsultaCadaFilaDelArchivoEnSuOrdenOriginal() {
        Set<String> normalizedNumbers = new LinkedHashSet<>(
                List.of("ENV-00953", "ENV-00956", "ENV-00958"));
        when(repository.findExistingShipmentNumbers(normalizedNumbers))
                .thenReturn(Set.of("ENV-00953"));

        var result = service.compare(List.of(
                " env-00953 ", "ENV-00956", "env-00956", "ENV-00958"));

        assertThat(result.totalRows()).isEqualTo(4);
        assertThat(result.validCount()).isEqualTo(1);
        assertThat(result.duplicateCount()).isEqualTo(3);
        assertThat(result.alreadyRegisteredCount()).isEqualTo(1);
        assertThat(result.duplicatedInFileCount()).isEqualTo(2);
        assertThat(result.rows()).extracting("row").containsExactly(1, 2, 3, 4);
        assertThat(result.rows().get(0).shipmentNumber()).isEqualTo("ENV-00953");
        assertThat(result.rows().get(0).reasons())
                .containsExactly(DuplicateShipmentNumberReason.ALREADY_REGISTERED);
        assertThat(result.rows().get(0).repeatedInRows()).isEmpty();
        assertThat(result.rows().get(3).reasons()).isEmpty();
        verify(repository).findExistingShipmentNumbers(normalizedNumbers);
    }

    @Test
    void marcaTodasLasCopiasRepetidasEIndicaEnQueOtrasFilasAparecen() {
        when(repository.findExistingShipmentNumbers(Set.of("ENV-1", "ENV-2")))
                .thenReturn(Set.of());

        var result = service.compare(List.of("ENV-1", "ENV-2", "env-1", "ENV-1"));

        assertThat(result.rows().get(0).reasons())
                .containsExactly(DuplicateShipmentNumberReason.DUPLICATED_IN_FILE);
        assertThat(result.rows().get(0).repeatedInRows()).containsExactly(3, 4);
        assertThat(result.rows().get(2).repeatedInRows()).containsExactly(1, 4);
        assertThat(result.rows().get(3).repeatedInRows()).containsExactly(1, 3);
        assertThat(result.rows().get(1).reasons()).isEmpty();
        assertThat(result.validCount()).isEqualTo(1);
        assertThat(result.duplicatedInFileCount()).isEqualTo(3);
    }

    @Test
    void informaLasDosCausasPeroCuentaLaFilaUnaSolaVezComoYaRegistrada() {
        when(repository.findExistingShipmentNumbers(Set.of("ENV-00953")))
                .thenReturn(Set.of("ENV-00953"));

        var result = service.compare(List.of("ENV-00953", "env-00953"));

        assertThat(result.rows()).allSatisfy(row -> assertThat(row.reasons()).containsExactly(
                DuplicateShipmentNumberReason.ALREADY_REGISTERED,
                DuplicateShipmentNumberReason.DUPLICATED_IN_FILE));
        assertThat(result.validCount()).isZero();
        assertThat(result.alreadyRegisteredCount()).isEqualTo(2);
        assertThat(result.duplicatedInFileCount()).isZero();
        assertThat(result.duplicateCount()).isEqualTo(2);
    }
}
