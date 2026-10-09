package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;

/**
 * Contrato para cualquier DTO que incluya un documento de identidad.
 */
public interface DocumentHolder {
    DocumentType getDocumentType();
    String getDocumentNumber();
}
