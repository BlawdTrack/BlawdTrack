package com.blawdgourmet.blawdtrack.packages.validation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ShipmentNumberNormalizerTest {

    @Test
    void recortaYConvierteElNumeroDeEnvioAMayusculas() {
        assertThat(ShipmentNumberNormalizer.normalize(" env-00953 ")).isEqualTo("ENV-00953");
        assertThat(ShipmentNumberNormalizer.normalize(null)).isNull();
    }
}
