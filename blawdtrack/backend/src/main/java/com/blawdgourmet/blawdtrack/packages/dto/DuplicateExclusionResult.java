package com.blawdgourmet.blawdtrack.packages.dto;

import java.util.List;

/**
 * @param importable filas sin duplicados, en el mismo orden en que llegaron
 * @param report     clasificación de cada fila y contadores, igual al de la comparación
 */
public record DuplicateExclusionResult<T>(
        List<T> importable,
        ShipmentNumberComparisonResponse report) {
}
