package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.common.exception.DuplicateResourceException;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Centraliza la validación de unicidad para el registro de administradores.
 */
@Component
@RequiredArgsConstructor
public class AdminUniquenessValidator {

    private final UserRepository userRepository;

    public void validateNew(DocumentType documentType, String documentNumber, String email) {
        if (documentType != null && documentNumber != null
                && userRepository.existsByDocumentTypeAndDocumentNumber(documentType, documentNumber)) {
            throw new DuplicateResourceException(
                    "DOCUMENTO_DUPLICADO",
                    "The entered identity document is already associated with another registered user in the system."
            );
        }

        if (documentNumber != null && userRepository.existsByDocumentId(documentNumber)) {
            throw new DuplicateResourceException(
                    "DOCUMENTO_DUPLICADO",
                    "The entered identity document is already associated with another registered user in the system."
            );
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException(
                    "DUPLICATE_EMAIL",
                    "The email address entered is already registered in the system."
            );
        }
    }
}
