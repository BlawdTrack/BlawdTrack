package com.blawdgourmet.blawdtrack.packages.indexing;

public interface SchemaInspector {
    boolean columnExists(String tableName, String columnName);

    boolean hasIndexStartingWith(String tableName, String columnName);
}
