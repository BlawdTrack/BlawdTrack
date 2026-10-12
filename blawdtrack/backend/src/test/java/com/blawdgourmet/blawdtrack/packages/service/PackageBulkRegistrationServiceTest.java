package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class PackageBulkRegistrationServiceTest {

    private final DeliveryPackageRepository repository = mock(DeliveryPackageRepository.class);
    private final DeliveryPackageMapper mapper = new DefaultDeliveryPackageMapper(
            new ZohoDeliveryWindowPolicy());
    private final PackageBulkRegistrationService service =
            new PackageBulkRegistrationService(repository, mapper);

    @Test
    void persisteTodoElLoteConEstadoPendienteYRangoCalculado() {
        ImportedPackage first = imported(" env-100 ", "De 10 a 2");
        ImportedPackage second = imported("ENV-200", "9:00 a.m. a 4:00 p.m.");
        when(repository.saveAllAndFlush(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.registerValidPackages(List.of(first, second));

        assertThat(result.registeredCount()).isEqualTo(2);
        assertThat(result.registeredShipmentNumbers()).containsExactly("ENV-100", "ENV-200");
        verify(repository).saveAllAndFlush(anyList());
    }

    @Test
    void mapperAsignaDatosEstadoYHorasSinAcoplarlosAlServicio() {
        DeliveryPackage entity = mapper.toEntity(imported("ENV-300", "De 10 a 2"));

        assertThat(entity.getShipmentNumber()).isEqualTo("ENV-300");
        assertThat(entity.getOrderNumber()).isEqualTo("SO-ENV-300");
        assertThat(entity.getCustomerName()).isEqualTo("Cliente prueba");
        assertThat(entity.getStatus()).isEqualTo(PackageStatus.PENDING);
        assertThat(entity.getDeliveryStartTime()).isEqualTo(LocalTime.of(10, 0));
        assertThat(entity.getDeliveryEndTime()).isEqualTo(LocalTime.of(14, 0));
    }

    @Test
    void loteVacioNoInvocaLaPersistenciaYNuloSeRechaza() {
        assertThat(service.registerValidPackages(List.of()).registeredCount()).isZero();
        verifyNoInteractions(repository);
        assertThatThrownBy(() -> service.registerValidPackages(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private ImportedPackage imported(String shipmentNumber, String schedule) {
        return new ImportedPackage(
                shipmentNumber,
                "SO-" + shipmentNumber.trim(),
                "Cliente prueba",
                "San José",
                "8888-8888",
                schedule,
                List.of()
        );
    }
}
