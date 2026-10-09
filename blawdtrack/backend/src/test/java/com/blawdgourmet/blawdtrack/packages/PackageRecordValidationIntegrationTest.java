package com.blawdgourmet.blawdtrack.packages;

import static org.assertj.core.api.Assertions.assertThat;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.parser.PackageFileParser;
import com.blawdgourmet.blawdtrack.packages.service.DefaultDeliverySchedulePolicy;
import com.blawdgourmet.blawdtrack.packages.service.PackageRecordValidationService;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class PackageRecordValidationIntegrationTest {

    @Autowired
    private PackageFileParser parser;

    @Autowired
    private PackageRecordValidationService validationService;

    @Test
    void procesaUnArchivoRealYSeparaValidosDeInvalidosSinDetenerElLote() {
        String csv = """
                Packing Number,SO Number,Customer Name,Shipping Address,Shipping Phone,Notes
                ENV-100,SO-100,Cliente Valido,San Jose,8888-8888,
                ENV-200,,Cliente Sin Datos,,,De 10 a 2
                ,SO-300,Cliente Sin Envio,Heredia,8777-7777,
                """;

        var parsedPackages = parser.parse(
                new ByteArrayInputStream(csv.getBytes(StandardCharsets.UTF_8)),
                "paquetes.csv"
        );
        var result = validationService.validate(parsedPackages);

        assertThat(parsedPackages).hasSize(3);
        assertThat(result.validRecords()).singleElement().satisfies(validPackage -> {
            assertThat(validPackage.shipmentNumber()).isEqualTo("ENV-100");
            assertThat(validPackage.schedule())
                    .isEqualTo(DefaultDeliverySchedulePolicy.DEFAULT_SCHEDULE);
        });
        assertThat(result.invalidRecords()).hasSize(2);
        assertThat(result.invalidRecords())
                .filteredOn(invalid -> "ENV-200".equals(invalid.packageData().shipmentNumber()))
                .singleElement()
                .satisfies(invalid -> {
                    assertThat(invalid.packageData().schedule()).isEqualTo("De 10 a 2");
                    assertThat(invalid.issues())
                            .extracting(issue -> issue.field())
                            .containsExactly("orderNumber", "address", "phone");
                });
        assertThat(result.invalidRecords())
                .filteredOn(invalid -> invalid.packageData().shipmentNumber() == null)
                .singleElement()
                .satisfies(invalid -> assertThat(invalid.issues())
                        .extracting(issue -> issue.field())
                        .containsExactly("shipmentNumber"));
        assertThat(result.validRecords())
                .extracting(ImportedPackage::shipmentNumber)
                .containsExactly("ENV-100");
    }
}
