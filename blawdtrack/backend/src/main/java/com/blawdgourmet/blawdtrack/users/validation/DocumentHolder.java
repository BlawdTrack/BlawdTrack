package com.blawdgourmet.blawdtrack.users.validation;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;

/**
 * Contrato para cualquier DTO que incluya un documento de identidad.
 */
public interface DocumentHolder {
    DocumentType getDocumentType();
    String getDocumentNumber();
}
