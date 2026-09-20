package com.blawdgourmet.blawdtrack.users.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CedulaValidator implements ConstraintValidator<ValidCedula, String> {

    // Cédula nacional (9 dígitos, por ejemplo 1-2345-6789) o DIMEX/DIDI para extranjeros (11-12 dígitos).
    // Los guiones y espacios se ignoran porque son solo separadores visuales.
    private static final int MIN_DIGITOS = 9;
    private static final int MAX_DIGITOS = 12;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            // La obligatoriedad se reporta con @NotBlank; esto solo evita un NPE.
            return true;
        }

        String soloDigitos = value.replaceAll("[\\s-]", "");

        if (!soloDigitos.matches("\\d+")) {
            return false;
        }

        int longitud = soloDigitos.length();
        return longitud >= MIN_DIGITOS && longitud <= MAX_DIGITOS;
    }
}
