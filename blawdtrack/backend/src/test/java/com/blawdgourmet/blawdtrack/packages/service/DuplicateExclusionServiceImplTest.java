package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class DuplicateExclusionServiceImplTest {

    private record Row(String shipmentNumber, String customer) { }

    private final DeliveryPackageRepository repository = mock(DeliveryPackageRepository.class);
    private final DuplicateExclusionService service = new DuplicateExclusionServiceImpl(
            new ShipmentNumberComparisonServiceImpl(repository));

    @Test
    void conservaSoloLasFilasSinDuplicadosEnSuOrdenOriginal() {
        when(repository.findExistingShipmentNumbers(anyCollection())).thenReturn(Set.of("ENV-2"));
        Row first = new Row("ENV-1", "Ana");
        Row registered = new Row("env-2", "Beto");
        Row repeated = new Row("ENV-3", "Carla");
        Row repeatedCopy = new Row(" env-3 ", "Carla");
        Row last = new Row("ENV-4", "Dario");

        var result = service.excludeDuplicates(
                List.of(first, registered, repeated, repeatedCopy, last), Row::shipmentNumber);

        assertThat(result.importable()).containsExactly(first, last);
        assertThat(result.report().totalRows()).isEqualTo(5);
        assertThat(result.report().validCount()).isEqualTo(2);
        assertThat(result.report().alreadyRegisteredCount()).isEqualTo(1);
        assertThat(result.report().duplicatedInFileCount()).isEqualTo(2);
        assertThat(result.report().duplicateCount()).isEqualTo(3);
    }

    @Test
    void sinDuplicadosImportaTodasLasFilas() {
        when(repository.findExistingShipmentNumbers(anyCollection())).thenReturn(Set.of());
        List<Row> rows = List.of(new Row("ENV-1", "Ana"), new Row("ENV-2", "Beto"));

        var result = service.excludeDuplicates(rows, Row::shipmentNumber);

        assertThat(result.importable()).containsExactlyElementsOf(rows);
        assertThat(result.report().duplicateCount()).isZero();
    }

    @Test
    void archivoVacioNoConsultaLaBaseDeDatos() {
        var result = service.excludeDuplicates(List.<Row>of(), Row::shipmentNumber);

        assertThat(result.importable()).isEmpty();
        assertThat(result.report().totalRows()).isZero();
        assertThat(result.report().rows()).isEmpty();
        verifyNoInteractions(repository);
    }
}
