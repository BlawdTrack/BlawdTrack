package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.common.security.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.CreateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.model.Courier;
import com.blawdgourmet.blawdtrack.couriers.repository.CourierRepository;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Registro de mensajeros (HU-003). Un mensajero son dos registros: la cuenta {@link User} (documento, contacto,
 * contraseña, estado y rol) y el perfil {@link Courier} (horario y capacidad de carga), que se guardan en la misma
 * transacción.
 */
@Service
@RequiredArgsConstructor
public class CourierRegistrationService {

    private final UserRepository users;
    private final RoleRepository roles;
    private final CourierRepository couriers;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryPasswordGenerator temporaryPasswords;
    private final ApplicationEventPublisher events;
    private final CourierUniquenessValidator uniquenessValidator;
    private final AuditService auditService;

    /**
     * Registra un mensajero: valida la unicidad, crea la cuenta activa con rol MENSAJERO y una
     * contraseña temporal (cifrada), crea el perfil y publica {@link CourierRegisteredEvent}. El correo
     * de bienvenida se envía solo si la transacción se confirma.
     *
     * @param actor Súper Usuario que registra; queda como responsable en la auditoría
     * @throws DuplicateCourierException si el documento, correo o teléfono ya existen
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse register(CreateCourierRequest request, AuthenticatedUser actor) {
        DocumentType documentType = request.documentType() == null
                ? DocumentType.CEDULA
                : request.documentType();

        String documentNumber = request.documentNumber();

        uniquenessValidator.validateNew(
                documentType,
                documentNumber,
                request.email(),
                request.phone()
        );

        var role = roles.findByName(RoleName.COURIER)
                .orElseThrow(() -> new IllegalStateException(
                        "El rol MENSAJERO no está configurado"
                ));

        String temporaryPassword = temporaryPasswords.generate();

        var user = users.saveAndFlush(User.builder()
                .documentType(documentType)
                .documentNumber(documentNumber)
                .documentId(documentNumber)
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .status(UserStatus.ACTIVE)
                .role(role)
                .build());

        var courier = couriers.saveAndFlush(Courier.builder()
                .user(user)
                .schedule(request.schedule())
                .maxPackageWeightKg(request.maxPackageWeightKg())
                .build());

        // Como el resto del historial, el detalle no lleva datos personales: solo indica el alta.
        auditService.logAction(AuditAction.COURIER_CREATED, actor, user, "created");

        events.publishEvent(new CourierRegisteredEvent(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                temporaryPassword
        ));

        return CourierResponse.from(courier);
    }
}
