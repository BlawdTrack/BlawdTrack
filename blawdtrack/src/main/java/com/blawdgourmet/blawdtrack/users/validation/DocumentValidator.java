package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class DocumentValidator implements ConstraintValidator<ValidDocument, DocumentHolder> {

    // Cédula nacional (9 dígitos, por ejemplo 1-2345-6789) o DIMEX/DIDI para extranjeros (11-12 dígitos).
    // Los guiones y espacios se ignoran porque son solo separadores visuales.
    private static final int CEDULA_MIN_DIGITOS = 9;
    private static final int CEDULA_MAX_DIGITOS = 12;

    private static final int DIMEX_MIN_DIGITOS = 11;
    private static final int DIMEX_MAX_DIGITOS = 12;

    // Supuesto pendiente de confirmar con la empresa: no hay un rango de longitud
    // oficial para pasaportes, se asume uno razonable (formato ICAO: la mayoría
    // de pasaportes usan hasta 9 caracteres, se deja margen adicional).
    private static final int PASAPORTE_MIN_LONGITUD = 5;
    private static final int PASAPORTE_MAX_LONGITUD = 15;

    @Override
    public boolean isValid(DocumentHolder value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        DocumentType tipo = value.documentType();
        String numero = value.documentNumber();

        if (tipo == null || numero == null || numero.isBlank()) {
            // La obligatoriedad de cada campo se reporta con @NotNull/@NotBlank; esto solo evita un NPE.
            return true;
        }

        return switch (tipo) {
            case CEDULA -> isValidCedula(numero);
            case DIMEX -> isValidDimex(numero);
            case PASAPORTE -> isValidPasaporte(numero);
        };
    }

    private boolean isValidCedula(String numero) {
        String soloDigitos = numero.replaceAll("[\\s-]", "");
        if (!soloDigitos.matches("\\d+")) {
            return false;
        }
        int longitud = soloDigitos.length();
        return longitud >= CEDULA_MIN_DIGITOS && longitud <= CEDULA_MAX_DIGITOS;
    }

    private boolean isValidDimex(String numero) {
        if (!numero.matches("\\d+")) {
            return false;
        }
        int longitud = numero.length();
        return longitud >= DIMEX_MIN_DIGITOS && longitud <= DIMEX_MAX_DIGITOS;
    }

    private boolean isValidPasaporte(String numero) {
        if (!numero.matches("[A-Za-z0-9]+")) {
            return false;
        }
        if (numero.matches("\\d+")) {
            // Nunca puramente numérico: evita registrar una cédula/DIMEX real como pasaporte.
            return false;
        }
        int longitud = numero.length();
        return longitud >= PASAPORTE_MIN_LONGITUD && longitud <= PASAPORTE_MAX_LONGITUD;
    }
}
