package com.blawdgourmet.blawdtrack.packages;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import com.blawdgourmet.blawdtrack.packages.service.DuplicateExclusionService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DuplicateExclusionIntegrationTest {

    @Autowired private DuplicateExclusionService exclusion;
    @Autowired private DeliveryPackageRepository packages;

    @Test
    void excluyeLosRegistradosEnLaBaseDeDatosYLosRepetidosDelArchivo() {
        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber("env-00953").build());

        var result = exclusion.excludeDuplicates(
                List.of("ENV-00953", "ENV-00956", "env-00956", "ENV-00958"), number -> number);

        assertThat(result.importable()).containsExactly("ENV-00958");
        assertThat(result.report().validCount()).isEqualTo(1);
        assertThat(result.report().alreadyRegisteredCount()).isEqualTo(1);
        assertThat(result.report().duplicatedInFileCount()).isEqualTo(2);
    }

    @Test
    void alConfirmarDetectaLosPaquetesRegistradosDespuesDeLaPrevisualizacion() {
        List<String> file = List.of("ENV-00970", "ENV-00971");

        assertThat(exclusion.excludeDuplicates(file, number -> number).importable())
                .containsExactlyElementsOf(file);

        packages.saveAndFlush(DeliveryPackage.builder().shipmentNumber("ENV-00971").build());

        assertThat(exclusion.excludeDuplicates(file, number -> number).importable())
                .containsExactly("ENV-00970");
    }
}
