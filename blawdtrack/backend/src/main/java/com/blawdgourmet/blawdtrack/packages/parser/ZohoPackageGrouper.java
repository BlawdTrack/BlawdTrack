package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackageItem;
import com.blawdgourmet.blawdtrack.packages.dto.ParsedPackageFile;
import com.blawdgourmet.blawdtrack.packages.validation.ShipmentNumberNormalizer;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Agrupa las filas de Zoho por número de envío (HU010, task 263).
 * Los campos obligatorios vacíos se conservan para que la task 264 clasifique
 * cada registro sin interrumpir el resto del archivo.
 *
 * <p>Las filas del mismo número con datos compatibles son un solo paquete (una línea por artículo). Si el número
 * vuelve a aparecer con datos contradictorios, esa otra versión se separa como copia en vez de rechazar el archivo
 * entero (HU011): el primer paquete se conserva y las copias se informan como duplicados en el archivo.
 */
@Component
final class ZohoPackageGrouper {

    ParsedPackageFile group(TableData table) {
        ZohoColumn.validateRequiredHeaders(table.headers());
        boolean hasShipmentColumn = ZohoColumn.SHIPMENT_NUMBER.isPresentIn(table.headers());
        Map<String, List<PackageAccumulator>> groupsByShipment = new LinkedHashMap<>();
        for (TableRow row : table.rows()) {
            String shipmentNumber = normalizeShipmentNumber(shipmentNumberOf(row, hasShipmentColumn));
            String groupingKey = shipmentNumber == null
                    ? "__missing_shipment_row_" + row.number()
                    : shipmentNumber;
            List<PackageAccumulator> groups =
                    groupsByShipment.computeIfAbsent(groupingKey, ignored -> new ArrayList<>());
            PackageAccumulator accumulator = groups.stream()
                    .filter(group -> group.accepts(row))
                    .findFirst()
                    .orElseGet(() -> addGroup(groups, PackageAccumulator.from(shipmentNumber, row)));
            accumulator.merge(row);
            accumulator.addItem(itemFrom(row));
        }
        return new ParsedPackageFile(
                groupsByShipment.values().stream().map(groups -> groups.getFirst().toImportedPackage()).toList(),
                groupsByShipment.values().stream()
                        .flatMap(groups -> groups.stream().skip(1))
                        .map(PackageAccumulator::toImportedPackage)
                        .toList());
    }

    private static PackageAccumulator addGroup(List<PackageAccumulator> groups, PackageAccumulator group) {
        groups.add(group);
        return group;
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
        if (quantity.signum() == 0) {
            return null;
        }
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

    /**
     * Si el archivo no trae la columna Packing Number (exportación de Órdenes de venta) el paquete se identifica
     * por su número de orden; si la trae y la celda está vacía, el registro se informa como inválido.
     */
    private static String shipmentNumberOf(TableRow row, boolean hasShipmentColumn) {
        return hasShipmentColumn
                ? row.first(ZohoColumn.SHIPMENT_NUMBER)
                : row.first(ZohoColumn.ORDER_NUMBER);
    }

    private static String normalizeShipmentNumber(String value) {
        return value == null || value.isBlank() ? null : ShipmentNumberNormalizer.normalize(value);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
