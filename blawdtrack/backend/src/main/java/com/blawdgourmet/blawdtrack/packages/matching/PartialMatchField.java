package com.blawdgourmet.blawdtrack.packages.matching;

public record PartialMatchField(String attributeName, PartialMatchFieldType type) {

    public PartialMatchField {
        if (attributeName == null || attributeName.isBlank()) {
            throw new IllegalArgumentException("El nombre del atributo no puede estar vacío");
        }
        if (type == null) {
            throw new IllegalArgumentException("El tipo del campo no puede ser nulo");
        }
    }

    public static PartialMatchField text(String attributeName) {
        return new PartialMatchField(attributeName, PartialMatchFieldType.TEXT);
    }

    public static PartialMatchField phone(String attributeName) {
        return new PartialMatchField(attributeName, PartialMatchFieldType.PHONE);
    }
}