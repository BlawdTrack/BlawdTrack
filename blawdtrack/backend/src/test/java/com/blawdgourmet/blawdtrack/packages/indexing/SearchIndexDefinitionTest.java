package com.blawdgourmet.blawdtrack.packages.indexing;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SearchIndexDefinitionTest {

    @Test
    void validaReglasDeNomenclaturaYCamposRequeridos() {
        assertThat(new SearchIndexDefinition("paquetes", "numero_orden", "idx_paquetes_numero_orden")).isNotNull();

        assertThatThrownBy(() -> new SearchIndexDefinition(null, "numero_orden", "idx_paquetes_numero_orden"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new SearchIndexDefinition("paquetes", "", "idx_paquetes_numero_orden"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new SearchIndexDefinition("paquetes", "numero_orden", ""))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new SearchIndexDefinition("paquetes", "numero_orden", "IDX_PAQUETES_NUMERO_ORDEN"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void catalogoEsInmutableYSinNumeroEnvio() {
        PackageSearchIndexCatalog catalog = new PackageSearchIndexCatalog();
        List<SearchIndexDefinition> definitions = catalog.definitions();

        assertThat(definitions).isNotNull();
        assertThatThrownBy(() -> definitions.add(new SearchIndexDefinition("paquetes", "numero_orden", "idx_paquetes_numero_orden_aux")))
                .isInstanceOf(UnsupportedOperationException.class);
        assertThat(definitions).extracting(SearchIndexDefinition::indexName)
                .doesNotContain("idx_paquetes_numero_envio");
        assertThat(definitions).extracting(SearchIndexDefinition::indexName)
                .doesNotHaveDuplicates();
    }
}
