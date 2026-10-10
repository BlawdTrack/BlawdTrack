package com.blawdgourmet.blawdtrack.packages.parser;

import java.util.List;

/** Tabla intermedia independiente del formato de archivo que la originó. */
record TableData(List<String> headers, List<TableRow> rows) {

    TableData {
        headers = List.copyOf(headers);
        rows = List.copyOf(rows);
    }
}
