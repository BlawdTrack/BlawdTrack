package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackageItem;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.Charset;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

@Component
public class ZohoPackageFileParser implements PackageFileParser {

    private static final List<String> SHIPMENT_NUMBER = aliases(
            "Packing Number", "Package Number", "Shipment Number", "Numero de envio", "Numero de paquete");
    private static final List<String> ORDER_NUMBER = aliases(
            "SO Number", "Sales Order Number", "Order Number", "Numero de orden");
    private static final List<String> CUSTOMER_NAME = aliases(
            "Customer Name", "Cliente");
    private static final List<String> SHIPPING_ADDRESS = aliases(
            "Shipping Address", "Direccion de envio", "Direccion");
    private static final List<String> SHIPPING_CITY = aliases("Shipping City", "Ciudad de envio");
    private static final List<String> SHIPPING_STATE = aliases("Shipping State", "Provincia de envio");
    private static final List<String> SHIPPING_COUNTRY = aliases("Shipping Country", "Pais de envio");
    private static final List<String> SHIPPING_CODE = aliases("Shipping Code", "Codigo postal de envio");
    private static final List<String> SHIPPING_PHONE = aliases(
            "Shipping Phone", "Telefono de envio", "Phone", "Telefono");
    private static final List<String> BILLING_PHONE = aliases("Billing Phone", "Telefono de facturacion");
    private static final List<String> SCHEDULE = aliases(
            "Schedule", "Delivery Schedule", "Shipping Schedule", "Shipping Hours", "Delivery Time", "Horario", "Notes");
    private static final List<String> ITEM_ID = aliases("PackageItemID", "Package Item ID", "Item ID");
    private static final List<String> ITEM_NAME = aliases("Item Name", "Articulo", "Nombre del articulo");
    private static final List<String> QUANTITY = aliases("Quantity Packed", "Quantity", "Cantidad");
    private static final List<String> SKU = aliases("SKU");
    private static final List<String> ITEM_PRICE = aliases("Item Price", "Unit Price", "Precio");

    @Override
    public List<ImportedPackage> parse(InputStream input, String fileName) {
        if (input == null) {
            throw new PackageFileParsingException("El archivo es obligatorio");
        }
        String extension = extensionOf(fileName);
        try {
            List<TableRow> rows = switch (extension) {
                case "csv" -> readCsv(input);
                case "xlsx" -> readXlsx(input);
                default -> throw new PackageFileParsingException(
                        "Formato no compatible. Solo se permiten archivos .csv y .xlsx");
            };
            return groupRows(rows);
        } catch (PackageFileParsingException exception) {
            throw exception;
        } catch (IOException | RuntimeException exception) {
            throw new PackageFileParsingException("No se pudo leer el archivo de paquetes", exception);
        }
    }

    private List<TableRow> readCsv(InputStream input) throws IOException {
        byte[] bytes = input.readAllBytes();
        String content = decodeCsv(bytes);
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ByteArrayInputStream(content.getBytes(StandardCharsets.UTF_8)), StandardCharsets.UTF_8));
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setIgnoreEmptyLines(true)
                     .setTrim(false)
                     .get()
                     .parse(reader)) {
            var iterator = parser.iterator();
            if (!iterator.hasNext()) {
                throw new PackageFileParsingException("El archivo no contiene encabezados");
            }
            List<String> headers = recordValues(iterator.next());
            validateHeaders(headers);
            List<TableRow> rows = new ArrayList<>();
            while (iterator.hasNext()) {
                CSVRecord record = iterator.next();
                List<String> values = recordValues(record);
                if (!allBlank(values)) {
                    rows.add(new TableRow(headers, values, record.getRecordNumber()));
                }
            }
            return rows;
        }
    }

    private List<TableRow> readXlsx(InputStream input) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(input)) {
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            for (Sheet sheet : workbook) {
                Row headerRow = firstNonBlankRow(sheet, formatter, evaluator);
                if (headerRow == null) {
                    continue;
                }
                int width = headerRow.getLastCellNum();
                List<String> headers = cellValues(headerRow, width, formatter, evaluator);
                validateHeaders(headers);
                List<TableRow> rows = new ArrayList<>();
                for (int index = headerRow.getRowNum() + 1; index <= sheet.getLastRowNum(); index++) {
                    Row row = sheet.getRow(index);
                    if (row == null) {
                        continue;
                    }
                    List<String> values = cellValues(row, width, formatter, evaluator);
                    if (!allBlank(values)) {
                        rows.add(new TableRow(headers, values, index + 1L));
                    }
                }
                return rows;
            }
        }
        throw new PackageFileParsingException("El archivo no contiene una hoja con datos");
    }

    private List<ImportedPackage> groupRows(List<TableRow> rows) {
        if (rows.isEmpty()) {
            return List.of();
        }
        Map<String, PackageAccumulator> packages = new LinkedHashMap<>();
        for (TableRow row : rows) {
            String shipmentNumber = required(row, SHIPMENT_NUMBER, "Packing Number").toUpperCase(Locale.ROOT);
            PackageAccumulator accumulator = packages.computeIfAbsent(shipmentNumber,
                    ignored -> PackageAccumulator.from(shipmentNumber, row));
            accumulator.merge(row);
            ImportedPackageItem item = itemFrom(row);
            if (item != null) {
                accumulator.items.add(item);
            }
        }
        return packages.values().stream().map(PackageAccumulator::toImportedPackage).toList();
    }

    private ImportedPackageItem itemFrom(TableRow row) {
        String name = row.first(ITEM_NAME);
        String itemId = row.first(ITEM_ID);
        String quantityText = row.first(QUANTITY);
        if (name.isBlank() && itemId.isBlank() && quantityText.isBlank()) {
            return null;
        }
        if (name.isBlank()) {
            throw row.error("El nombre del articulo es obligatorio");
        }
        BigDecimal quantity = decimal(quantityText, "Quantity Packed", row, true);
        BigDecimal price = decimal(row.first(ITEM_PRICE), "Item Price", row, false);
        return new ImportedPackageItem(blankToNull(itemId), name, quantity,
                blankToNull(row.first(SKU)), price);
    }

    private static BigDecimal decimal(String value, String field, TableRow row, boolean required) {
        if (value.isBlank()) {
            if (required) {
                throw row.error("El campo " + field + " es obligatorio");
            }
            return null;
        }
        try {
            return new BigDecimal(value.trim().replace("\u00a0", "").replace(",", ""));
        } catch (NumberFormatException exception) {
            throw row.error("El campo " + field + " debe ser numerico: " + value);
        }
    }

    private static String required(TableRow row, List<String> aliases, String field) {
        String value = row.first(aliases);
        if (value.isBlank()) {
            throw row.error("El campo " + field + " es obligatorio");
        }
        return value;
    }

    private static void validateHeaders(List<String> headers) {
        Set<String> normalized = headers.stream().map(ZohoPackageFileParser::normalizeHeader)
                .collect(Collectors.toSet());
        requireHeader(normalized, SHIPMENT_NUMBER, "Packing Number");
        requireHeader(normalized, ORDER_NUMBER, "SO Number");
        requireHeader(normalized, CUSTOMER_NAME, "Customer Name");
    }

    private static void requireHeader(Set<String> headers, List<String> aliases, String expected) {
        if (aliases.stream().noneMatch(headers::contains)) {
            throw new PackageFileParsingException("Falta el encabezado obligatorio: " + expected);
        }
    }

    private static Row firstNonBlankRow(Sheet sheet, DataFormatter formatter, FormulaEvaluator evaluator) {
        for (Row row : sheet) {
            int width = Math.max(row.getLastCellNum(), 0);
            if (!allBlank(cellValues(row, width, formatter, evaluator))) {
                return row;
            }
        }
        return null;
    }

    private static List<String> cellValues(
            Row row, int width, DataFormatter formatter, FormulaEvaluator evaluator) {
        List<String> values = new ArrayList<>(width);
        for (int index = 0; index < width; index++) {
            Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            values.add(cell == null ? "" : formatter.formatCellValue(cell, evaluator).trim());
        }
        return values;
    }

    private static List<String> recordValues(CSVRecord record) {
        List<String> values = new ArrayList<>(record.size());
        record.forEach(value -> values.add(value == null ? "" : value.trim()));
        return values;
    }

    private static String decodeCsv(byte[] bytes) {
        int offset = bytes.length >= 3 && bytes[0] == (byte) 0xEF && bytes[1] == (byte) 0xBB
                && bytes[2] == (byte) 0xBF ? 3 : 0;
        try {
            return StandardCharsets.UTF_8.newDecoder()
                    .onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT)
                    .decode(ByteBuffer.wrap(bytes, offset, bytes.length - offset)).toString();
        } catch (CharacterCodingException exception) {
            return Charset.forName("windows-1252").decode(ByteBuffer.wrap(bytes)).toString();
        }
    }

    private static String extensionOf(String fileName) {
        if (fileName == null || fileName.isBlank() || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    private static List<String> aliases(String... values) {
        return Arrays.stream(values).map(ZohoPackageFileParser::normalizeHeader).toList();
    }

    private static String normalizeHeader(String value) {
        String withoutAccents = Normalizer.normalize(Objects.requireNonNullElse(value, ""), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "");
        return withoutAccents.replace("\uFEFF", "").replaceAll("[^A-Za-z0-9]", "")
                .toLowerCase(Locale.ROOT);
    }

    private static boolean allBlank(List<String> values) {
        return values.stream().allMatch(String::isBlank);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String cleanPhone(String value) {
        String cleaned = value == null ? "" : value.trim();
        return cleaned.startsWith("'") ? cleaned.substring(1) : cleaned;
    }

    private static final class TableRow {
        private final Map<String, List<String>> values;
        private final long number;

        private TableRow(List<String> headers, List<String> rowValues, long number) {
            this.number = number;
            this.values = new LinkedHashMap<>();
            for (int index = 0; index < headers.size(); index++) {
                String key = normalizeHeader(headers.get(index));
                String value = index < rowValues.size() ? rowValues.get(index).trim() : "";
                values.computeIfAbsent(key, ignored -> new ArrayList<>()).add(value);
            }
        }

        private String first(List<String> aliases) {
            return all(aliases).stream().findFirst().orElse("");
        }

        private List<String> all(List<String> aliases) {
            return aliases.stream().flatMap(alias -> values.getOrDefault(alias, List.of()).stream())
                    .filter(value -> !value.isBlank()).toList();
        }

        private PackageFileParsingException error(String message) {
            return new PackageFileParsingException("Fila " + number + ": " + message);
        }
    }

    private static final class PackageAccumulator {
        private final String shipmentNumber;
        private String orderNumber;
        private String customerName;
        private String address;
        private String phone;
        private String schedule;
        private final List<ImportedPackageItem> items = new ArrayList<>();

        private PackageAccumulator(String shipmentNumber) {
            this.shipmentNumber = shipmentNumber;
        }

        private static PackageAccumulator from(String shipmentNumber, TableRow row) {
            PackageAccumulator accumulator = new PackageAccumulator(shipmentNumber);
            accumulator.orderNumber = required(row, ORDER_NUMBER, "SO Number");
            accumulator.customerName = required(row, CUSTOMER_NAME, "Customer Name");
            accumulator.address = addressFrom(row);
            accumulator.phone = cleanPhone(firstNonBlank(row.first(SHIPPING_PHONE), row.first(BILLING_PHONE)));
            accumulator.schedule = row.first(SCHEDULE);
            return accumulator;
        }

        private void merge(TableRow row) {
            orderNumber = mergeField(orderNumber, row.first(ORDER_NUMBER), "SO Number", row);
            customerName = mergeField(customerName, row.first(CUSTOMER_NAME), "Customer Name", row);
            address = mergeField(address, addressFrom(row), "Shipping Address", row);
            phone = mergeField(phone,
                    cleanPhone(firstNonBlank(row.first(SHIPPING_PHONE), row.first(BILLING_PHONE))),
                    "Shipping Phone", row);
            schedule = mergeField(schedule, row.first(SCHEDULE), "Schedule", row);
        }

        private ImportedPackage toImportedPackage() {
            return new ImportedPackage(shipmentNumber, orderNumber, customerName,
                    blankToNull(address), blankToNull(phone), blankToNull(schedule), items);
        }

        private static String mergeField(String current, String incoming, String field, TableRow row) {
            if (incoming == null || incoming.isBlank()) {
                return current;
            }
            if (current == null || current.isBlank()) {
                return incoming;
            }
            if (!current.equals(incoming)) {
                throw row.error("El paquete repite " + field + " con valores diferentes");
            }
            return current;
        }

        private static String addressFrom(TableRow row) {
            LinkedHashSet<String> parts = new LinkedHashSet<>();
            addAll(parts, row.all(SHIPPING_ADDRESS));
            addAll(parts, row.all(SHIPPING_CITY));
            addAll(parts, row.all(SHIPPING_STATE));
            addAll(parts, row.all(SHIPPING_COUNTRY));
            addAll(parts, row.all(SHIPPING_CODE));
            return String.join(", ", parts);
        }

        private static void addAll(Set<String> destination, List<String> values) {
            values.stream().map(String::trim).filter(value -> !value.isBlank()).forEach(destination::add);
        }

        private static String firstNonBlank(String... values) {
            return Arrays.stream(values).filter(Objects::nonNull).filter(value -> !value.isBlank())
                    .findFirst().orElse("");
        }
    }
}
