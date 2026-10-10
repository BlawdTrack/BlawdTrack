package com.blawdgourmet.blawdtrack.packages.indexing;

import java.util.Objects;
import java.util.regex.Pattern;

public record SearchIndexDefinition(String tableName, String columnName, String indexName) {
    private static final Pattern INDEX_NAME_PATTERN = Pattern.compile("^idx_[a-z0-9_]+$");

    public SearchIndexDefinition {
        tableName = requireText("tableName", tableName);
        columnName = requireText("columnName", columnName);
        indexName = requireText("indexName", indexName);

        if (!INDEX_NAME_PATTERN.matcher(indexName).matches()) {
            throw new IllegalArgumentException("El nombre del índice debe seguir el estándar IS-011: idx_ + tabla + columna(s)");
        }
    }

    private static String requireText(String fieldName, String value) {
        String normalized = value == null ? null : value.trim();
        if (normalized == null || normalized.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " no puede estar vacío.");
        }
        return normalized;
    }
}
