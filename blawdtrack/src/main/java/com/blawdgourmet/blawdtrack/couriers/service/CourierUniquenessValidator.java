package com.blawdgourmet.blawdtrack.couriers.service;

import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourierUniquenessValidator {
    private final UserRepository users;

    public void validateNew(String nationalId, String email, String phone) {
        if (users.existsByNationalId(nationalId)) {
            throw new DuplicateCourierException("La cédula ya está registrada");
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
