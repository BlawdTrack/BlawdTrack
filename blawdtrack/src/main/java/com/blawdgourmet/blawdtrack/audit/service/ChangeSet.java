package com.blawdgourmet.blawdtrack.audit.service;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Acumula los nombres de los campos cuyo valor cambió. Nunca conserva los valores
 * comparados (ni anteriores ni nuevos), solo el nombre del campo.
 */
public final class ChangeSet {

    private final Set<String> fields = new LinkedHashSet<>();

    /**
     * Registra {@code field} si {@code before} y {@code after} difieren.
     * Dos {@link BigDecimal} se comparan por valor numérico (25.5 equivale a 25.50).
     *
     * @throws IllegalArgumentException si {@code field} es nulo o está en blanco
     */
    public ChangeSet track(String field, Object before, Object after) {
        if (field == null || field.isBlank()) {
            throw new IllegalArgumentException("field must not be null or blank");
        }
        if (differ(before, after)) {
            fields.add(field);
        }
        return this;
    }

    public boolean isEmpty() {
        return fields.isEmpty();
    }

    /** Nombres de los campos modificados, en orden de inserción y sin duplicados. */
    public List<String> changedFields() {
        return List.copyOf(fields);
    }

    /** Nombres unidos por ", " (cadena vacía si no hay cambios). */
    public String describe() {
        return String.join(", ", fields);
    }

    private static boolean differ(Object before, Object after) {
        if (before instanceof BigDecimal previous && after instanceof BigDecimal current) {
            return previous.compareTo(current) != 0;
        }
        return !Objects.equals(before, after);
    }
}
