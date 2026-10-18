package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/**
 * Resultado de la validación de una fila del archivo importado. Una fila es válida
 * cuando {@code reasons} está vacío; {@code repeatedInRows} lista las demás filas
 * (base 1) que traen el mismo número de envío.
 */
public record ShipmentNumberRowResult(
        int row,
        String shipmentNumber,
        List<DuplicateShipmentNumberReason> reasons,
        List<Integer> repeatedInRows) {
}
