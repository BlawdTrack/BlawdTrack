package com.blawdgourmet.blawdtrack.users.validation;

import java.util.Locale;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Normaliza el valor de un documento para que siempre se compare, valide y persista
 * con la misma representación canónica.
 */
public final class DocumentNormalizer {

    private DocumentNormalizer() {
    }

    public static String normalize(DocumentType documentType, String documentNumber) {
        if (documentNumber == null) {
            return null;
        }
        if (documentType == null) {
            return null;
        }

        String normalized = documentNumber.trim();

        return switch (documentType) {
            case CEDULA -> normalized.replace(" ", "").replace("-", "");
            case DIMEX -> normalized.trim();
            case PASAPORTE -> normalized.trim().toUpperCase(Locale.ROOT);
        };
    }
}
