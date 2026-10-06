package com.blawdgourmet.blawdtrack.packages.parser;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

/** Lee archivos XLSX exportados por Zoho Inventory (HU010, task 263). */
@Component
final class XlsxTableReader implements TableReader {

    @Override
    public String extension() {
        return "xlsx";
    }

    @Override
    public TableData read(InputStream input) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(input)) {
            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            for (Sheet sheet : workbook) {
                Row headerRow = firstNonBlankRow(sheet, formatter, evaluator);
                if (headerRow == null) {
                    continue;
                }
                int width = headerRow.getLastCellNum();
                List<String> headers = valuesOf(headerRow, width, formatter, evaluator);
                List<TableRow> rows = new ArrayList<>();
                for (int index = headerRow.getRowNum() + 1; index <= sheet.getLastRowNum(); index++) {
                    Row row = sheet.getRow(index);
                    if (row == null) {
                        continue;
                    }
                    List<String> values = valuesOf(row, width, formatter, evaluator);
                    if (!allBlank(values)) {
                        rows.add(new TableRow(headers, values, index + 1L));
                    }
                }
                return new TableData(headers, rows);
            }
        }
        throw new PackageFileParsingException("El archivo no contiene una hoja con datos");
    }

    private static Row firstNonBlankRow(
            Sheet sheet, DataFormatter formatter, FormulaEvaluator evaluator) {
        for (Row row : sheet) {
            int width = Math.max(row.getLastCellNum(), 0);
            if (!allBlank(valuesOf(row, width, formatter, evaluator))) {
                return row;
            }
        }
        return null;
    }

    private static List<String> valuesOf(
            Row row, int width, DataFormatter formatter, FormulaEvaluator evaluator) {
        List<String> values = new ArrayList<>(width);
        for (int index = 0; index < width; index++) {
            Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            values.add(cell == null ? "" : formatter.formatCellValue(cell, evaluator).trim());
        }
        return values;
    }

    private static boolean allBlank(List<String> values) {
        return values.stream().allMatch(String::isBlank);
    }
}
