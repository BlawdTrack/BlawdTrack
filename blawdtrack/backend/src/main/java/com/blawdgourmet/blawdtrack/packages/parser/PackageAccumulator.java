package com.blawdgourmet.blawdtrack.packages.parser;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackageItem;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/** Acumula las filas que pertenecen al mismo paquete de Zoho. */
final class PackageAccumulator {

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

    static PackageAccumulator from(String shipmentNumber, TableRow row) {
        PackageAccumulator accumulator = new PackageAccumulator(shipmentNumber);
        accumulator.orderNumber = row.first(ZohoColumn.ORDER_NUMBER);
        accumulator.customerName = row.first(ZohoColumn.CUSTOMER_NAME);
        accumulator.address = addressFrom(row);
        accumulator.phone = cleanPhone(firstNonBlank(
                row.first(ZohoColumn.SHIPPING_PHONE), row.first(ZohoColumn.BILLING_PHONE)));
        accumulator.schedule = row.first(ZohoColumn.SCHEDULE);
        return accumulator;
    }

    void merge(TableRow row) {
        orderNumber = mergeField(orderNumber, row.first(ZohoColumn.ORDER_NUMBER),
                ZohoColumn.ORDER_NUMBER, row);
        customerName = mergeField(customerName, row.first(ZohoColumn.CUSTOMER_NAME),
                ZohoColumn.CUSTOMER_NAME, row);
        address = mergeField(address, addressFrom(row), ZohoColumn.SHIPPING_ADDRESS, row);
        phone = mergeField(phone, cleanPhone(firstNonBlank(
                        row.first(ZohoColumn.SHIPPING_PHONE), row.first(ZohoColumn.BILLING_PHONE))),
                ZohoColumn.SHIPPING_PHONE, row);
        schedule = mergeField(schedule, row.first(ZohoColumn.SCHEDULE), ZohoColumn.SCHEDULE, row);
    }

    void addItem(ImportedPackageItem item) {
        if (item != null) {
            items.add(item);
        }
    }

    ImportedPackage toImportedPackage() {
        return new ImportedPackage(shipmentNumber, orderNumber, customerName,
                blankToNull(address), blankToNull(phone), blankToNull(schedule), items);
    }

    private static String mergeField(
            String current, String incoming, ZohoColumn column, TableRow row) {
        if (incoming == null || incoming.isBlank()) {
            return current;
        }
        if (current == null || current.isBlank()) {
            return incoming;
        }
        if (!current.equals(incoming)) {
            throw row.error("El paquete repite " + column.label() + " con valores diferentes");
        }
        return current;
    }

    private static String addressFrom(TableRow row) {
        LinkedHashSet<String> parts = new LinkedHashSet<>();
        addAll(parts, row.all(ZohoColumn.SHIPPING_ADDRESS));
        addAll(parts, row.all(ZohoColumn.SHIPPING_CITY));
        addAll(parts, row.all(ZohoColumn.SHIPPING_STATE));
        addAll(parts, row.all(ZohoColumn.SHIPPING_COUNTRY));
        addAll(parts, row.all(ZohoColumn.SHIPPING_CODE));
        return String.join(", ", parts);
    }

    private static void addAll(Set<String> destination, List<String> values) {
        values.stream().map(String::trim).filter(value -> !value.isBlank()).forEach(destination::add);
    }

    private static String firstNonBlank(String... values) {
        return Arrays.stream(values)
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .findFirst()
                .orElse("");
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private static String cleanPhone(String value) {
        String cleaned = value == null ? "" : value.trim();
        return cleaned.startsWith("'") ? cleaned.substring(1) : cleaned;
    }
}
