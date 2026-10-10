package com.blawdgourmet.blawdtrack.packages.indexing;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Supplier;

@Component
public final class JdbcMetadataSchemaInspector implements SchemaInspector {
    private final Supplier<Connection> connectionSupplier;

    public JdbcMetadataSchemaInspector(Connection connection) {
        this(() -> connection);
    }

    @Autowired
    public JdbcMetadataSchemaInspector(DataSource dataSource) {
        this(() -> {
            try {
                return dataSource.getConnection();
            } catch (SQLException exception) {
                throw new IllegalStateException("No se pudo abrir la conexión para inspeccionar el esquema.", exception);
            }
        });
    }

    JdbcMetadataSchemaInspector(Supplier<Connection> connectionSupplier) {
        this.connectionSupplier = Objects.requireNonNull(connectionSupplier, "connectionSupplier no puede ser nulo.");
    }

    @Override
    public boolean columnExists(String tableName, String columnName) {
        String normalizedTable = normalizeIdentifier(tableName);
        String normalizedColumn = normalizeIdentifier(columnName);

        try {
            Connection connection = connectionSupplier.get();
            try (ResultSet columns = connection.getMetaData().getColumns(null, null, null, null)) {
                while (columns.next()) {
                    String currentTable = columns.getString("TABLE_NAME");
                    String currentColumn = columns.getString("COLUMN_NAME");
                    if (currentTable != null && currentColumn != null
                            && normalizedTable.equalsIgnoreCase(currentTable)
                            && normalizedColumn.equalsIgnoreCase(currentColumn)) {
                        return true;
                    }
                }
                return false;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("No se pudo verificar si la columna existe en la tabla " + normalizedTable + ".", exception);
        }
    }

    @Override
    public boolean hasIndexStartingWith(String tableName, String columnName) {
        String normalizedTable = normalizeIdentifier(tableName);
        String normalizedColumn = normalizeIdentifier(columnName);

        try {
            Connection connection = connectionSupplier.get();
            try (ResultSet indexes = getIndexInfoForTable(connection, normalizedTable)) {
                Map<String, Integer> firstColumnPositions = new HashMap<>();
                Map<String, String> firstColumnsByIndex = new HashMap<>();

                while (indexes.next()) {
                    String currentTable = indexes.getString("TABLE_NAME");
                    String indexName = indexes.getString("INDEX_NAME");
                    String indexColumnName = indexes.getString("COLUMN_NAME");
                    if (currentTable == null || indexName == null || indexColumnName == null) {
                        continue;
                    }
                    if (!normalizedTable.equalsIgnoreCase(currentTable)) {
                        continue;
                    }

                    int ordinalPosition = indexes.getInt("ORDINAL_POSITION");
                    Integer currentPosition = firstColumnPositions.get(indexName);
                    if (currentPosition == null || ordinalPosition < currentPosition) {
                        firstColumnPositions.put(indexName, ordinalPosition);
                        firstColumnsByIndex.put(indexName, indexColumnName);
                    }
                }

                for (String firstColumnName : firstColumnsByIndex.values()) {
                    if (normalizedColumn.equalsIgnoreCase(firstColumnName)) {
                        return true;
                    }
                }
                return false;
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("No se pudo verificar si la tabla " + normalizedTable + " ya tiene un índice para la columna " + normalizedColumn + ".", exception);
        }
    }

    private ResultSet getIndexInfoForTable(Connection connection, String tableName) throws SQLException {
        if (tableName == null || tableName.isBlank()) {
            return connection.getMetaData().getIndexInfo(null, null, null, false, false);
        }

        String[] candidates = {
                tableName,
                tableName.toUpperCase(Locale.ROOT),
                tableName.toLowerCase(Locale.ROOT)
        };

        for (String candidate : candidates) {
            ResultSet indexes = connection.getMetaData().getIndexInfo(null, null, candidate, false, false);
            if (indexes.next()) {
                indexes.beforeFirst();
                return indexes;
            }
            indexes.close();
        }

        return connection.getMetaData().getIndexInfo(null, null, tableName, false, false);
    }

    private String normalizeIdentifier(String value) {
        return value == null ? null : value.trim();
    }
}
