package com.blawdgourmet.blawdtrack.users.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Valida el formato y la consistencia del documento de identidad a nivel de clase.
 */
@Documented
@Constraint(validatedBy = DocumentValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDocument {

    String message() default "The document number is not valid for the selected document type.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
