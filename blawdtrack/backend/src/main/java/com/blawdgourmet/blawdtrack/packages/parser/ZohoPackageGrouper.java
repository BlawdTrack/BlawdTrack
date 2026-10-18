package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackageItem;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;
import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Agrupa las filas de Zoho por número de envío (HU010, task 263).
 * Los campos obligatorios vacíos se conservan para que la task 264 clasifique
 * cada registro sin interrumpir el resto del archivo.
 */
@Component
final class ZohoPackageGrouper {

    List<ImportedPackage> group(TableData table) {
        ZohoColumn.validateRequiredHeaders(table.headers());
        Map<String, PackageAccumulator> packages = new LinkedHashMap<>();
        for (TableRow row : table.rows()) {
            String shipmentNumber = normalizeShipmentNumber(row.first(ZohoColumn.SHIPMENT_NUMBER));
            String groupingKey = shipmentNumber == null
                    ? "__missing_shipment_row_" + row.number()
                    : shipmentNumber;
            PackageAccumulator accumulator = packages.computeIfAbsent(
                    groupingKey, ignored -> PackageAccumulator.from(shipmentNumber, row));
            accumulator.merge(row);
            accumulator.addItem(itemFrom(row));
        }
        return packages.values().stream().map(PackageAccumulator::toImportedPackage).toList();
    }

    private static ImportedPackageItem itemFrom(TableRow row) {
        String name = row.first(ZohoColumn.ITEM_NAME);
        String itemId = row.first(ZohoColumn.ITEM_ID);
        String quantityText = row.first(ZohoColumn.QUANTITY);
        if (name.isBlank() && itemId.isBlank() && quantityText.isBlank()) {
            return null;
        }
        if (name.isBlank()) {
            throw row.error("El nombre del articulo es obligatorio");
        }
        BigDecimal quantity = decimal(quantityText, ZohoColumn.QUANTITY, row, true);
        BigDecimal price = decimal(row.first(ZohoColumn.ITEM_PRICE), ZohoColumn.ITEM_PRICE, row, false);
        return new ImportedPackageItem(blankToNull(itemId), name, quantity,
                blankToNull(row.first(ZohoColumn.SKU)), price);
    }

    private static BigDecimal decimal(
            String value, ZohoColumn column, TableRow row, boolean required) {
        if (value.isBlank()) {
            if (required) {
                throw row.error("El campo " + column.label() + " es obligatorio");
            }
            return null;
        }
        String normalized = value.trim().replace("\u00a0", "");
        if (normalized.contains(",")) {
            throw row.error("El campo " + column.label()
                    + " debe usar punto como separador decimal: " + value);
        }
        try {
            return new BigDecimal(normalized);
        } catch (NumberFormatException exception) {
            throw row.error("El campo " + column.label() + " debe ser numerico: " + value);
        }
    }

    private static String normalizeShipmentNumber(String value) {
        return value == null || value.isBlank() ? null : ShipmentNumberNormalizer.normalize(value);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
