package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Gestión de mensajeros ya registrados (HU-004 editar y HU-005 activar o desactivar): datos, estado de acceso y
 * contraseña. El registro vive en {@link CourierRegistrationService} y las consultas en {@link CourierQueryService}.
 */
@Service
@RequiredArgsConstructor
public class CourierService {

    private final UserRepository users;
    private final CourierRepository couriers;
    private final PasswordEncoder passwordEncoder;
    private final CourierUniquenessValidator uniquenessValidator;
    private final AuditService auditService;
    private final CourierDeactivationValidator deactivationValidator;
    private final CourierLookup lookup;
    private final CourierChangeDetector changeDetector;

    /**
     * Actualiza los datos editables del mensajero. Si algún campo cambió, deja una auditoría
     * {@code ACTUALIZAR_MENSAJERO} con los nombres de los campos modificados. El documento, el rol y
     * el estado no se cambian aquí.
     *
     * @param id    id numérico del mensajero o su número de documento
     * @param actor Súper Usuario que actualiza; queda como responsable en la auditoría
     * @throws CourierNotFoundException  si no existe
     * @throws DuplicateCourierException si el correo o teléfono pertenecen a otro usuario
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse update(String id, UpdateCourierRequest request, AuthenticatedUser actor) {
        var courier = lookup.resolve(id);
        var user = courier.getUser();

        uniquenessValidator.validateUpdate(
                user.getId(),
                request.email(),
                request.phone()
        );

        String details = changeDetector.changedFields(user, courier, request);

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        courier.setSchedule(request.schedule());
        courier.setMaxPackageWeightKg(request.maxPackageWeightKg());

        users.saveAndFlush(user);
        couriers.saveAndFlush(courier);

        if (!details.isBlank()) {
            auditService.logAction(AuditAction.COURIER_UPDATED, actor, user, details);
        }

        return CourierResponse.from(courier);
    }

    /**
     * Activa o desactiva el acceso del mensajero. {@link User#changeStatus} sube el
     * {@code tokenVersion}, por lo que la sesión activa deja de ser válida en su
     * siguiente solicitud. Desactivar exige que el mensajero no tenga asignaciones activas.
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse changeStatus(String id, UserStatus newStatus, AuthenticatedUser actor) {
        var courier = lookup.resolve(id);
        var user = courier.getUser();

        if (user.getStatus() == newStatus) {
            return CourierResponse.from(courier);
        }

        if (newStatus == UserStatus.INACTIVE) {
            deactivationValidator.validateCanDeactivate(courier.getId());
        }

        user.changeStatus(newStatus);
        users.saveAndFlush(user);

        auditService.logAction(
                newStatus == UserStatus.INACTIVE
                        ? AuditAction.COURIER_DEACTIVATED
                        : AuditAction.COURIER_ACTIVATED,
                actor,
                user,
                "status"
        );

        return CourierResponse.from(courier);
    }

    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public void changePassword(String id, String newPassword, AuthenticatedUser actor) {
        var user = lookup.resolve(id).getUser();

        user.changePassword(passwordEncoder.encode(newPassword));
        users.saveAndFlush(user);

        auditService.logAction(AuditAction.COURIER_PASSWORD_CHANGED, actor, user, "password");
    }
}
