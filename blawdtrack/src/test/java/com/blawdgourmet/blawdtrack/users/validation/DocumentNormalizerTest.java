package com.blawdgourmet.blawdtrack.users.validation;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

class DocumentNormalizerTest {

    @Test
    void normalizaCedula() {
        assertThat(DocumentNormalizer.normalize(DocumentType.CEDULA, " 1-2345-6789 ")).isEqualTo("123456789");
        assertThat(DocumentNormalizer.normalize(DocumentType.CEDULA, null)).isNull();
    }

    @Test
    void normalizaDimex() {
        assertThat(DocumentNormalizer.normalize(DocumentType.DIMEX, " 12345678901 ")).isEqualTo("12345678901");
        assertThat(DocumentNormalizer.normalize(DocumentType.DIMEX, null)).isNull();
    }

    @Test
    void normalizaPasaporte() {
        assertThat(DocumentNormalizer.normalize(DocumentType.PASAPORTE, " ab123 ")).isEqualTo("AB123");
        assertThat(DocumentNormalizer.normalize(DocumentType.PASAPORTE, null)).isNull();
    }

    @Test
    void devuelveNuloCuandoTipoEsNulo() {
        assertThat(DocumentNormalizer.normalize(null, "abc")).isNull();
    }
}
