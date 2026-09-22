package com.blawdgourmet.blawdtrack.couriers.service;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.audit.service.ChangeSet;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.couriers.dto.CreateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourierService {
    // Nombres de campo que se registran en el historial de auditoría (nunca sus valores).
    private static final String FIELD_FULL_NAME = "fullName";
    private static final String FIELD_EMAIL = "email";
    private static final String FIELD_PHONE = "phone";
    private static final String FIELD_SCHEDULE = "schedule";
    private static final String FIELD_MAX_PACKAGE_WEIGHT = "maxPackageWeightKg";
    private static final String FIELD_STATUS = "status";

    private final UserRepository users;
    private final RoleRepository roles;
    private final CourierRepository couriers;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryPasswordGenerator temporaryPasswords;
    private final ApplicationEventPublisher events;
    private final CourierUniquenessValidator uniquenessValidator;
    private final CourierDeactivationValidator deactivationValidator;
    private final AuditService audit;

    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse register(CreateCourierRequest request) {
        uniquenessValidator.validateNew(request.documentType(), request.documentNumber(), request.email(), request.phone());
        var role = roles.findByName(RoleName.COURIER)
                .orElseThrow(() -> new IllegalStateException("El rol MENSAJERO no está configurado"));
        String temporaryPassword = temporaryPasswords.generate();
        var user = users.saveAndFlush(User.builder()
                .documentType(request.documentType()).documentNumber(request.documentNumber()).fullName(request.fullName())
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
    public CourierResponse update(Long courierId, UpdateCourierRequest request, AuthenticatedUser actor) {
        var courier = couriers.findById(courierId)
                .orElseThrow(() -> new CourierNotFoundException("Mensajero no encontrado"));
        var user = courier.getUser();
        uniquenessValidator.validateUpdate(user.getId(), request.email(), request.phone());
        // Se compara antes de aplicar los setters, mientras la entidad conserva los valores actuales.
        var changes = new ChangeSet()
                .track(FIELD_FULL_NAME, user.getFullName(), request.fullName())
                .track(FIELD_EMAIL, user.getEmail(), request.email())
                .track(FIELD_PHONE, user.getPhone(), request.phone())
                .track(FIELD_SCHEDULE, courier.getSchedule(), request.schedule())
                .track(FIELD_MAX_PACKAGE_WEIGHT, courier.getMaxPackageWeightKg(), request.maxPackageWeightKg());
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        courier.setSchedule(request.schedule());
        courier.setMaxPackageWeightKg(request.maxPackageWeightKg());
        users.saveAndFlush(user);
        couriers.saveAndFlush(courier);
        if (!changes.isEmpty()) {
            audit.logAction(AuditAction.COURIER_UPDATED, actor, user, changes.describe());
        }
        return CourierResponse.from(courier);
    }

    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse deactivate(Long courierId, AuthenticatedUser actor) {
        var courier = couriers.findById(courierId)
                .orElseThrow(() -> new CourierNotFoundException("Mensajero no encontrado"));
        deactivationValidator.validateCanDeactivate(courierId);
        var user = courier.getUser();
        var changes = new ChangeSet().track(FIELD_STATUS, user.getStatus(), UserStatus.INACTIVE);
        user.changeStatus(UserStatus.INACTIVE);
        users.saveAndFlush(user);
        if (!changes.isEmpty()) {
            audit.logAction(AuditAction.COURIER_DEACTIVATED, actor, user, changes.describe());
        }
        return CourierResponse.from(courier);
    }
}
