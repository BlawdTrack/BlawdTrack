package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CourierUniquenessValidator {
    private final UserRepository users;

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

    public void validateUpdate(Long userId, String email, String phone) {
        if (users.existsByEmailIgnoreCaseAndIdNot(email, userId)) {
            throw new DuplicateCourierException("El correo ya está registrado");
        }
        if (phone != null && users.existsByPhoneAndIdNot(phone, userId)) {
            throw new DuplicateCourierException("El teléfono ya está registrado");
        }
    }
}
