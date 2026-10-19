package com.blawdgourmet.blawdtrack.packages.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.blawdgourmet.blawdtrack.packages.service.DeliveryWindow;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class ValidPackagePreviewJsonTest {

    private final JsonMapper mapper = JsonMapper.builder().build();

    @Test
    void losDatosDelPaqueteYElRangoDeEntregaVanAlMismoNivel() {
        ImportedPackage imported = new ImportedPackage(
                "ENV-1", "SO-1", "Cliente", "San Jose", "8888-8888", "Antes de las 3 p.m.", List.of());
        ValidPackagePreview preview = new ValidPackagePreview(
                imported, new DeliveryWindow(LocalTime.of(9, 0), LocalTime.of(14, 0)));

        JsonNode json = mapper.valueToTree(preview);

        assertThat(json.get("shipmentNumber").asText()).isEqualTo("ENV-1");
        assertThat(json.get("schedule").asText()).isEqualTo("Antes de las 3 p.m.");
        assertThat(json.get("deliveryWindow").get("start").asText()).isEqualTo("09:00:00");
        assertThat(json.get("deliveryWindow").get("end").asText()).isEqualTo("14:00:00");
        assertThat(json.has("packageData")).isFalse();
    }
}
