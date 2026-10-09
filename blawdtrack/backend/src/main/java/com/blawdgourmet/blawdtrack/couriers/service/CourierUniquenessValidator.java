package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Valida que el documento, el correo y el teléfono de un mensajero no pertenezcan a otro usuario
 * (de cualquier rol). El correo se compara sin distinguir mayúsculas y el teléfono es opcional.
 */
@Component
@RequiredArgsConstructor
public class CourierUniquenessValidator {
    private final UserRepository users;

    /** Para un registro nuevo: comprueba documento (tipo y número), correo y teléfono. */
    public void validateNew(DocumentType documentType, String documentNumber, String email, String phone) {
        if (documentType != null && documentNumber != null
                && users.existsByDocumentTypeAndDocumentNumber(documentType, documentNumber)) {
            throw new DuplicateCourierException("El documento ya está registrado");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new DuplicateCourierException("El correo ya está registrado");
        }
        if (phone != null && users.existsByPhone(phone)) {
            throw new DuplicateCourierException("El teléfono ya está registrado");
        }
    }

    /** Para una edición: igual que el registro pero excluyendo al propio usuario. */
    public void validateUpdate(Long userId, String email, String phone) {
        if (users.existsByEmailIgnoreCaseAndIdNot(email, userId)) {
            throw new DuplicateCourierException("El correo ya está registrado");
        }
        if (phone != null && users.existsByPhoneAndIdNot(phone, userId)) {
            throw new DuplicateCourierException("El teléfono ya está registrado");
        }
    }
}
