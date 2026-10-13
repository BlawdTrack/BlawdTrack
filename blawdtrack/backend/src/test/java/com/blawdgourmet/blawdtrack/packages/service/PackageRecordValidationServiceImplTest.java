package com.blawdgourmet.blawdtrack.packages.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.validation.RequiredPackageFieldsValidator;
import java.util.List;
import org.junit.jupiter.api.Test;

class PackageRecordValidationServiceImplTest {

    private final PackageRecordValidationService service =
            new PackageRecordValidationServiceImpl(
                    List.of(new RequiredPackageFieldsValidator()),
                    new DefaultDeliverySchedulePolicy()
            );

    @Test
    void clasificaCadaRegistroSinBloquearLosValidos() {
        ImportedPackage validPackage = packageData(
                "ENV-1", "SO-1", "Cliente Uno", "San José", "8888-8888", "De 8 a 5");
        ImportedPackage invalidPackage = packageData(
                "ENV-2", " ", "Cliente Dos", null, "", null);

        var result = service.validate(List.of(validPackage, invalidPackage));

        assertThat(result.validRecords()).containsExactly(validPackage);
        assertThat(result.invalidRecords()).singleElement().satisfies(invalid -> {
            assertThat(invalid.packageData().shipmentNumber()).isEqualTo("ENV-2");
            assertThat(invalid.packageData().schedule())
                    .isEqualTo(DefaultDeliverySchedulePolicy.DEFAULT_SCHEDULE);
            assertThat(invalid.issues())
                    .extracting(issue -> issue.field())
                    .containsExactly("orderNumber", "address", "phone");
        });
    }

    @Test
    void asignaElHorarioPredeterminadoYConservaElHorarioRecibido() {
        ImportedPackage withoutSchedule = packageData(
                "ENV-1", "SO-1", "Cliente Uno", "Heredia", "8888-8888", "  ");
        ImportedPackage withSchedule = packageData(
                "ENV-2", "SO-2", "Cliente Dos", "Alajuela", "8777-7777", "De 10 a 2");

        var result = service.validate(List.of(withoutSchedule, withSchedule));

        assertThat(result.invalidRecords()).isEmpty();
        assertThat(result.validRecords())
                .extracting(ImportedPackage::schedule)
                .containsExactly(DefaultDeliverySchedulePolicy.DEFAULT_SCHEDULE, "De 10 a 2");
    }

    @Test
    void informaTodosLosCamposObligatoriosAusentesEnUnMismoRegistro() {
        ImportedPackage emptyPackage = packageData(null, "", " ", null, "", null);

        var result = service.validate(List.of(emptyPackage));

        assertThat(result.validRecords()).isEmpty();
        assertThat(result.invalidRecords()).singleElement().satisfies(invalid -> {
            assertThat(invalid.issues())
                    .extracting(issue -> issue.field())
                    .containsExactly(
                            "shipmentNumber", "orderNumber", "customerName", "address", "phone");
            assertThat(invalid.issues())
                    .extracting(issue -> issue.message())
                    .allMatch(message -> message.endsWith("es obligatorio"));
        });
    }

    @Test
    void rechazaUnaListaNulaConUnMensajeClaro() {
        assertThatThrownBy(() -> service.validate(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("La lista de paquetes es obligatoria");
    }

    private static ImportedPackage packageData(
            String shipmentNumber,
            String orderNumber,
            String customerName,
            String address,
            String phone,
            String schedule) {
        return new ImportedPackage(
                shipmentNumber, orderNumber, customerName, address, phone, schedule, List.of());
    }
}
