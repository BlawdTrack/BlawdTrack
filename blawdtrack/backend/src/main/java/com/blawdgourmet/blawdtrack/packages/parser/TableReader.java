package com.blawdgourmet.blawdtrack.packages.parser;

import java.io.IOException;
import java.io.InputStream;

/** Lee un formato de archivo y lo convierte a una tabla neutral. */
interface TableReader {

    String extension();

    TableData read(InputStream input) throws IOException;
}
