package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Valida el documento de identidad según el tipo seleccionado.
 */
public class DocumentValidator implements ConstraintValidator<ValidDocument, DocumentHolder> {

    @Override
    public boolean isValid(DocumentHolder value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        DocumentType documentType = value.getDocumentType();
        String documentNumber = value.getDocumentNumber();
        String normalizedDocument = DocumentNormalizer.normalize(documentType, documentNumber);

        if (documentType == null && documentNumber == null) {
            return true;
        }

        if (documentType == null) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("The document type is required.")
                    .addPropertyNode("documentType")
                    .addConstraintViolation();
            return false;
        }

        if (documentNumber == null || documentNumber.isBlank()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("The document number is required.")
                    .addPropertyNode("documentNumber")
                    .addConstraintViolation();
            return false;
        }

        if (normalizedDocument == null || normalizedDocument.isBlank()) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate("The document number is required.")
                    .addPropertyNode("documentNumber")
                    .addConstraintViolation();
            return false;
        }

        boolean valid = switch (documentType) {
            case CEDULA -> normalizedDocument.matches("\\d{9,12}");
            case DIMEX -> normalizedDocument.matches("\\d{9,12}");
            case PASAPORTE -> normalizedDocument.matches("^(?=.*[A-Za-z])[A-Za-z0-9]{5,15}$")
                    && !normalizedDocument.matches("\\d+");
        };

        if (!valid) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(
                            "The document number is not valid for the selected document type.")
                    .addPropertyNode("documentNumber")
                    .addConstraintViolation();
        }

        return valid;
    }
}
