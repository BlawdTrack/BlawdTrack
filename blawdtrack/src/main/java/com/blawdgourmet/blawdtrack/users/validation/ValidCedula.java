package com.blawdgourmet.blawdtrack.users.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Valida que una cédula tenga un formato numérico aceptable
 * (cédula nacional de 9 dígitos o DIMEX/DIDI de 11-12 dígitos para extranjeros, con o sin separadores de guion/espacio).
 * Requerido por HU-006: "El sistema debe validar que la cédula ingresada tenga un formato válido".
 */
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CedulaValidator.class)
public @interface ValidCedula {
 
    String message() default "The ID format is invalid.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
