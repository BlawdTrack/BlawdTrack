package com.blawdgourmet.blawdtrack.packages.parser;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Component;

/** Lee archivos CSV exportados por Zoho Inventory (HU010, task 263). */
@Component
final class CsvTableReader implements TableReader {

    @Override
    public String extension() {
        return "csv";
    }

    @Override
    public TableData read(InputStream input) throws IOException {
        String content = decode(input.readAllBytes());
        try (StringReader reader = new StringReader(content);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setIgnoreEmptyLines(true)
                     .setTrim(false)
                     .get()
                     .parse(reader)) {
            var iterator = parser.iterator();
            if (!iterator.hasNext()) {
                throw new PackageFileParsingException("El archivo no contiene encabezados");
            }
            List<String> headers = valuesOf(iterator.next());
            List<TableRow> rows = new ArrayList<>();
            while (iterator.hasNext()) {
                CSVRecord record = iterator.next();
                List<String> values = valuesOf(record);
                if (!allBlank(values)) {
                    rows.add(new TableRow(headers, values, record.getRecordNumber()));
                }
            }
            return new TableData(headers, rows);
        }
    }

    private static List<String> valuesOf(CSVRecord record) {
        List<String> values = new ArrayList<>(record.size());
        record.forEach(value -> values.add(value == null ? "" : value.trim()));
        return values;
    }

    private static String decode(byte[] bytes) {
        int offset = hasUtf8Bom(bytes) ? 3 : 0;
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes, offset, bytes.length - offset))
                    .toString();
        } catch (CharacterCodingException exception) {
            return Charset.forName("windows-1252").decode(ByteBuffer.wrap(bytes)).toString();
        }
    }

    private static boolean hasUtf8Bom(byte[] bytes) {
        return bytes.length >= 3
                && bytes[0] == (byte) 0xEF
                && bytes[1] == (byte) 0xBB
                && bytes[2] == (byte) 0xBF;
    }

    private static boolean allBlank(List<String> values) {
        return values.stream().allMatch(String::isBlank);
    }
}
