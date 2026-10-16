package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;

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
            return reject(context, "documentType", "The document type is required.");
        }
        if (isBlank(documentNumber) || isBlank(normalizedDocument)) {
            return reject(context, "documentNumber", "The document number is required.");
        }
        if (!hasValidFormat(documentType, normalizedDocument)) {
            return reject(context, "documentNumber",
                    "The document number is not valid for the selected document type.");
        }
        return true;
    }

    private static boolean isBlank(String text) {
        return text == null || text.isBlank();
    }

    private static boolean hasValidFormat(DocumentType documentType, String normalizedDocument) {
        return switch (documentType) {
            case CEDULA -> normalizedDocument.matches("\\d{9,12}");
            case DIMEX -> normalizedDocument.matches("\\d{9,12}");
            case PASAPORTE -> normalizedDocument.matches("^(?=.*[A-Za-z])[A-Za-z0-9]{5,15}$")
                    && !normalizedDocument.matches("\\d+");
        };
    }

    /** Sustituye el mensaje por defecto por uno asociado al campo indicado y devuelve siempre false. */
    private static boolean reject(ConstraintValidatorContext context, String property, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(property)
                .addConstraintViolation();
        return false;
    }
}
