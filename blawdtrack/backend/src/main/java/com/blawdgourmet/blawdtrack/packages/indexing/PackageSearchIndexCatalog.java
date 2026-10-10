package com.blawdgourmet.blawdtrack.packages.indexing;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class PackageSearchIndexCatalog {
    private static final List<SearchIndexDefinition> DEFINITIONS = List.of(
            new SearchIndexDefinition("paquetes", "numero_orden", "idx_paquetes_numero_orden"),
            new SearchIndexDefinition("paquetes", "nombre_cliente", "idx_paquetes_nombre_cliente"),
            new SearchIndexDefinition("paquetes", "direccion_entrega", "idx_paquetes_direccion_entrega"),
            new SearchIndexDefinition("paquetes", "telefono", "idx_paquetes_telefono"),
            new SearchIndexDefinition("paquetes", "horario_preferencia", "idx_paquetes_horario_preferencia")
    );

    public List<SearchIndexDefinition> definitions() {
        return DEFINITIONS;
    }
}
