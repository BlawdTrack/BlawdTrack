package com.blawdgourmet.blawdtrack.packages.indexing;

import org.flywaydb.core.api.MigrationVersion;
import org.flywaydb.core.api.migration.Context;
import org.flywaydb.core.api.migration.JavaMigration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Migración repetible para crear índices de búsqueda sobre la tabla paquetes.
 *
 * <p>Es repetible porque no usa una versión de Flyway: se ejecuta sobre el esquema actual y valida
 * metadata del catálogo para crear solo índices faltantes. El contrato de idempotencia es que un
 * segundo arranque no lanza errores y no duplica índices. Si la columna aún no existe en la rama
 * actual, esta migración registra un log informativo y la omite; nunca rompe la migración de base de
 * datos ni la validación de JPA.</p>
 *
 * <p>Advertencia de despliegue: una base de desarrollo que ya ejecutó esta migración antes de recibir
 * las columnas de T01 no la re-ejecuta sola. En ese caso se resuelve subiendo la constante de
 * checksum o eliminando la fila repetible de flyway_schema_history para forzar la reejecución.</p>
 */
@Component
public class PackageSearchIndexMigration implements JavaMigration {
    private static final Logger logger = LoggerFactory.getLogger(PackageSearchIndexMigration.class);
    private static final int CHECKSUM = 20261008;

    private final SearchIndexCreator searchIndexCreator;

    public PackageSearchIndexMigration(SearchIndexCreator searchIndexCreator) {
        this.searchIndexCreator = searchIndexCreator;
    }

    @Override
    public String getDescription() {
        return "crear indices busqueda paquetes";
    }

    @Override
    public MigrationVersion getVersion() {
        return null;
    }

    @Override
    public Integer getChecksum() {
        return CHECKSUM;
    }

    @Override
    public boolean canExecuteInTransaction() {
        return false;
    }

    @Override
    public void migrate(Context context) throws Exception {
        logger.info("Se inicia la validación de índices de búsqueda para la tabla paquetes.");
        searchIndexCreator.createMissingIndexes(context.getConnection());
    }
}
