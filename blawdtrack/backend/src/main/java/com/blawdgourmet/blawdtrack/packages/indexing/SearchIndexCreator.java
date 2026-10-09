package com.blawdgourmet.blawdtrack.packages.indexing;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public final class SearchIndexCreator {
    private static final Logger logger = LoggerFactory.getLogger(SearchIndexCreator.class);

    private final PackageSearchIndexCatalog catalog;
    private final SchemaInspector schemaInspector;

    public SearchIndexCreator(PackageSearchIndexCatalog catalog, SchemaInspector schemaInspector) {
        this.catalog = catalog;
        this.schemaInspector = schemaInspector;
    }

    public void createMissingIndexes(Connection connection) throws SQLException {
        for (SearchIndexDefinition definition : catalog.definitions()) {
            String tableName = definition.tableName();
            String columnName = definition.columnName();
            String indexName = definition.indexName();

            if (!schemaInspector.columnExists(tableName, columnName)) {
                logger.info("Se omite la creación del índice {} porque la columna {} no existe en {}.", indexName, columnName, tableName);
                continue;
            }

            if (schemaInspector.hasIndexStartingWith(tableName, columnName)) {
                logger.info("Se omite la creación del índice {} porque la columna {} ya tiene un índice asociado en {}.", indexName, columnName, tableName);
                continue;
            }

            String sql = "CREATE INDEX " + indexName + " ON " + tableName + " (" + columnName + ")";
            try (Statement statement = connection.createStatement()) {
                statement.execute(sql);
                logger.info("Se creó el índice {} en la columna {} de {}.", indexName, columnName, tableName);
            }
        }
    }
}
