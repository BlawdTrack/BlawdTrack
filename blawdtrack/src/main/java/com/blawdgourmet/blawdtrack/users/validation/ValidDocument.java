package com.blawdgourmet.blawdtrack.users.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Valida que el número de documento tenga un formato aceptable para su tipo
 * (CEDULA: 9-12 dígitos; DIMEX: 11-12 dígitos; PASAPORTE: alfanumérico, nunca
 * puramente numérico). Requerido por HU-006 y por el fix de documento genérico.
 */
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DocumentValidator.class)
public @interface ValidDocument {

    String message() default "The identity document is not in a valid format.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
