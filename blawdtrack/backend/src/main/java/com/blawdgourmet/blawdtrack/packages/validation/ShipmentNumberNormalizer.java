package com.blawdgourmet.blawdtrack.packages.validation;

import java.util.Locale;

/**
 * Normaliza los números de envío para que el parser y la validación contra la
 * base de datos utilicen la misma representación canónica (HU010, tasks 262 y 263).
 */
public final class ShipmentNumberNormalizer {

    private ShipmentNumberNormalizer() {
    }

    public static String normalize(String shipmentNumber) {
        return shipmentNumber == null
                ? null
                : shipmentNumber.trim().toUpperCase(Locale.ROOT);
    }
}
