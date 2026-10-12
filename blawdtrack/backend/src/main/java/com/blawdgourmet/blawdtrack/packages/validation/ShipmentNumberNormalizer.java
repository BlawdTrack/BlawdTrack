package com.blawdgourmet.blawdtrack.packages.validation;

import java.util.Locale;

/**
 * Normaliza el identificador para mantener consistente su persistencia y búsqueda.
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
