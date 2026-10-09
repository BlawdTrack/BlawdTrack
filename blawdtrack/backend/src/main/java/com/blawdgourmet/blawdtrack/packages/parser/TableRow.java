package com.blawdgourmet.blawdtrack.packages.parser;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Fila de tabla que conserva encabezados duplicados y su número de origen. */
final class TableRow {

    private final Map<String, List<String>> values = new LinkedHashMap<>();
    private final long number;

    TableRow(List<String> headers, List<String> rowValues, long number) {
        this.number = number;
        for (int index = 0; index < headers.size(); index++) {
            String key = HeaderNormalizer.normalize(headers.get(index));
            String value = index < rowValues.size() ? rowValues.get(index).trim() : "";
            values.computeIfAbsent(key, ignored -> new ArrayList<>()).add(value);
        }
    }

    String first(ZohoColumn column) {
        return all(column).stream().findFirst().orElse("");
    }

    List<String> all(ZohoColumn column) {
        return column.aliases().stream()
                .flatMap(alias -> values.getOrDefault(alias, List.of()).stream())
                .filter(value -> !value.isBlank())
                .toList();
    }

    long number() {
        return number;
    }

    PackageFileParsingException error(String message) {
        return new PackageFileParsingException("Fila " + number + ": " + message);
    }
}
