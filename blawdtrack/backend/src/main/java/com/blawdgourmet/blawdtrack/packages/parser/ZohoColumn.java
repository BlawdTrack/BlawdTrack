package com.blawdgourmet.blawdtrack.packages.parser;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Catálogo único de columnas y alias aceptados en las exportaciones de Zoho
 * Inventory (HU010, task 263).
 */
enum ZohoColumn {
    SHIPMENT_NUMBER(true, "Packing Number", "Package Number", "Shipment Number",
            "Numero de envio", "Numero de paquete"),
    ORDER_NUMBER(true, "SO Number", "Sales Order Number", "Order Number", "Numero de orden"),
    CUSTOMER_NAME(true, "Customer Name", "Cliente"),
    SHIPPING_ADDRESS(false, "Shipping Address", "Direccion de envio", "Direccion"),
    SHIPPING_CITY(false, "Shipping City", "Ciudad de envio"),
    SHIPPING_STATE(false, "Shipping State", "Provincia de envio"),
    SHIPPING_COUNTRY(false, "Shipping Country", "Pais de envio"),
    SHIPPING_CODE(false, "Shipping Code", "Codigo postal de envio"),
    SHIPPING_PHONE(false, "Shipping Phone", "Telefono de envio", "Phone", "Telefono"),
    BILLING_PHONE(false, "Billing Phone", "Telefono de facturacion"),
    SCHEDULE(false, "Schedule", "Delivery Schedule", "Shipping Schedule", "Shipping Hours",
            "Delivery Time", "Horario", "Notes"),
    ITEM_ID(false, "PackageItemID", "Package Item ID", "Item ID"),
    ITEM_NAME(false, "Item Name", "Articulo", "Nombre del articulo"),
    QUANTITY(false, "Quantity Packed", "Quantity", "Cantidad"),
    SKU(false, "SKU"),
    ITEM_PRICE(false, "Item Price", "Unit Price", "Precio");

    private final boolean requiredHeader;
    private final String label;
    private final List<String> aliases;

    ZohoColumn(boolean requiredHeader, String label, String... additionalAliases) {
        this.requiredHeader = requiredHeader;
        this.label = label;
        this.aliases = Arrays.stream(concat(label, additionalAliases))
                .map(HeaderNormalizer::normalize)
                .toList();
    }

    String label() {
        return label;
    }

    List<String> aliases() {
        return aliases;
    }

    static void validateRequiredHeaders(List<String> headers) {
        Set<String> normalizedHeaders = headers.stream()
                .map(HeaderNormalizer::normalize)
                .collect(Collectors.toSet());
        for (ZohoColumn column : values()) {
            if (column.requiredHeader && column.aliases.stream().noneMatch(normalizedHeaders::contains)) {
                throw new PackageFileParsingException(
                        "Falta el encabezado obligatorio: " + column.label);
            }
        }
    }

    private static String[] concat(String first, String[] remaining) {
        String[] values = new String[remaining.length + 1];
        values[0] = first;
        System.arraycopy(remaining, 0, values, 1, remaining.length);
        return values;
    }
}
