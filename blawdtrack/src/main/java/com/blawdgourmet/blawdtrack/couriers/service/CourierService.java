package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.CreateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CourierService {
    private final UserRepository users;
    private final RoleRepository roles;
    private final CourierRepository couriers;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryPasswordGenerator temporaryPasswords;
    private final ApplicationEventPublisher events;
    private final CourierUniquenessValidator uniquenessValidator;

    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse register(CreateCourierRequest request) {
        DocumentType documentType = request.documentType() == null ? DocumentType.CEDULA : request.documentType();
        String documentNumber = request.documentNumber();
        uniquenessValidator.validateNew(documentType, documentNumber, request.email(), request.phone());
        var role = roles.findByName(RoleName.COURIER)
                .orElseThrow(() -> new IllegalStateException("El rol MENSAJERO no está configurado"));
        String temporaryPassword = temporaryPasswords.generate();
        var user = users.saveAndFlush(User.builder()
                .documentType(documentType)
                .documentNumber(documentNumber)
                .documentId(documentNumber)
                .fullName(request.fullName())
                .email(request.email()).phone(request.phone())
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .status(UserStatus.ACTIVE).role(role).build());
        var courier = couriers.saveAndFlush(Courier.builder().user(user)
                .schedule(request.schedule()).maxPackageWeightKg(request.maxPackageWeightKg()).build());
        events.publishEvent(new CourierRegisteredEvent(user.getId(), user.getEmail(),
                user.getFullName(), temporaryPassword));
        return CourierResponse.from(courier);
    }

    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse update(String id, UpdateCourierRequest request) {
        var courier = resolveCourier(id);
        var user = courier.getUser();
        uniquenessValidator.validateUpdate(user.getId(), request.email(), request.phone());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        courier.setSchedule(request.schedule());
        courier.setMaxPackageWeightKg(request.maxPackageWeightKg());
        users.saveAndFlush(user);
        couriers.saveAndFlush(courier);
        return CourierResponse.from(courier);
    }

    private Courier resolveCourier(String id) {
        if (id == null || id.isBlank()) {
            throw new CourierNotFoundException("Mensajero no encontrado");
        }
        String normalized = id.trim();
        try {
            Long numericId = Long.valueOf(normalized);
            return couriers.findById(numericId)
                    .orElseThrow(() -> new CourierNotFoundException("Mensajero no encontrado"));
        } catch (NumberFormatException ex) {
            return couriers.findByUserDocumentId(normalized)
                    .orElseThrow(() -> new CourierNotFoundException("Mensajero no encontrado"));
        }
    }
}
