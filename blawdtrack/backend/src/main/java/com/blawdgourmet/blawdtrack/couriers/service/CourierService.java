package com.blawdgourmet.blawdtrack.couriers.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierHistoryEntry;
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

/**
 * Casos de uso de mensajeros (HU-003 registrar, HU-004 editar). Un mensajero son dos registros: la
 * cuenta {@link User} (documento, contacto, contraseña, estado y rol) y el perfil {@link Courier}
 * (horario y capacidad de carga), que se guardan en la misma transacción.
 */
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
    private final AuditService auditService;
    private final AuditLogRepository auditLogs;
    private final CourierDeactivationValidator deactivationValidator;

    private static final List<String> COURIER_AUDIT_ACTIONS = List.of(
            AuditAction.COURIER_CREATED.getCode(),
            AuditAction.COURIER_UPDATED.getCode(),
            AuditAction.COURIER_DEACTIVATED.getCode(),
            AuditAction.COURIER_ACTIVATED.getCode(),
            AuditAction.COURIER_PASSWORD_CHANGED.getCode());

    /**
     * Registra un mensajero: valida la unicidad, crea la cuenta activa con rol MENSAJERO y una
     * contraseña temporal (cifrada), crea el perfil y publica {@link CourierRegisteredEvent}. El correo
     * de bienvenida se envía solo si la transacción se confirma.
     *
     * @throws DuplicateCourierException si el documento, correo o teléfono ya existen
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse register(CreateCourierRequest request) {
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
        auditService.logAction(
                AuditAction.COURIER_CREATED,
                currentPrincipal(),
                user,
                "created"
        );

        events.publishEvent(new CourierRegisteredEvent(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                temporaryPassword
        ));

        return CourierResponse.from(courier);
    }

    /**
     * Actualiza los datos editables del mensajero. Si algún campo cambió, deja una auditoría
     * {@code ACTUALIZAR_MENSAJERO} con los nombres de los campos modificados. El documento, el rol y
     * el estado no se cambian aquí.
     *
     * @param id id numérico del mensajero o su número de documento
     * @throws CourierNotFoundException  si no existe
     * @throws DuplicateCourierException si el correo o teléfono pertenecen a otro usuario
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public CourierResponse update(
            String id,
            UpdateCourierRequest request
    ) {
        var courier = resolveCourier(id);
        var user = courier.getUser();

        uniquenessValidator.validateUpdate(
                user.getId(),
                request.email(),
                request.phone()
        );

        String details = buildAuditDetails(
                user,
                courier,
                request
        );

        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        courier.setSchedule(request.schedule());
        courier.setMaxPackageWeightKg(request.maxPackageWeightKg());

        users.saveAndFlush(user);
        couriers.saveAndFlush(courier);

        if (!details.isBlank()) {
            auditService.logAction(
                    AuditAction.COURIER_UPDATED,
                    currentPrincipal(),
                    user,
                    details
            );
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
    public CourierResponse changeStatus(String id, UserStatus newStatus) {
        var courier = resolveCourier(id);
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
                currentPrincipal(),
                user,
                "status"
        );

        return CourierResponse.from(courier);
    }

    /**
     * Define una nueva contraseña para el mensajero. Sube el {@code tokenVersion} (cierra su sesión activa)
     * y audita el cambio sin registrar nunca la contraseña.
     */
    @Transactional
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public void changePassword(String id, String newPassword) {
        var user = resolveCourier(id).getUser();

        user.changePassword(passwordEncoder.encode(newPassword));
        users.saveAndFlush(user);

        auditService.logAction(
                AuditAction.COURIER_PASSWORD_CHANGED,
                currentPrincipal(),
                user,
                "password"
        );
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierHistoryEntry> history(String id) {
        var user = resolveCourier(id).getUser();

        return auditLogs.findByUsuarioAfectadoIdAndActionInOrderByTimestampDescIdDesc(
                        user.getId(), COURIER_AUDIT_ACTIONS)
                .stream()
                .map(CourierHistoryEntry::from)
                .toList();
    }

    private AuthenticatedUser currentPrincipal() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }

    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('" + RoleName.SUPER_USER + "')")
    public List<CourierResponse> list() {
        return couriers.findAllByOrderByUserFullNameAsc()
                .stream()
                .map(CourierResponse::from)
                .toList();
    }

    private String buildAuditDetails(
            User user,
            Courier courier,
            UpdateCourierRequest request
    ) {
        List<String> fields = new ArrayList<>();

        if (!equals(user.getFullName(), request.fullName())) {
            fields.add("fullName");
        }

        if (!equals(user.getEmail(), request.email())) {
            fields.add("email");
        }

        if (!equals(user.getPhone(), request.phone())) {
            fields.add("phone");
        }

        if (!equals(courier.getSchedule(), request.schedule())) {
            fields.add("schedule");
        }

        if (!equals(
                courier.getMaxPackageWeightKg(),
                request.maxPackageWeightKg()
        )) {
            fields.add("maxPackageWeightKg");
        }

        return String.join(", ", fields);
    }

    private boolean equals(Object left, Object right) {
        if (left == null && right == null) {
            return true;
        }

        if (left == null || right == null) {
            return false;
        }

        if (left instanceof BigDecimal leftDecimal
                && right instanceof BigDecimal rightDecimal) {
            return leftDecimal.compareTo(rightDecimal) == 0;
        }

        if (left instanceof BigDecimal leftDecimal
                && right instanceof String rightText) {
            return leftDecimal.compareTo(
                    new BigDecimal(rightText)
            ) == 0;
        }

        if (left instanceof String leftText
                && right instanceof BigDecimal rightDecimal) {
            return new BigDecimal(leftText)
                    .compareTo(rightDecimal) == 0;
        }

        return left.equals(right);
    }

    /**
     * Ubica al mensajero por id numérico o, si el texto no es un número, por número de documento.
     * Ojo: un documento formado solo por dígitos se interpreta primero como id.
     */
    private Courier resolveCourier(String id) {
        if (id == null || id.isBlank()) {
            throw new CourierNotFoundException(
                    "Mensajero no encontrado"
            );
        }

        String normalized = id.trim();

        try {
            Long numericId = Long.valueOf(normalized);

            return couriers.findById(numericId)
                    .orElseThrow(() -> new CourierNotFoundException(
                            "Mensajero no encontrado"
                    ));
        } catch (NumberFormatException ex) {
            return couriers.findByUserDocumentId(normalized)
                    .orElseThrow(() -> new CourierNotFoundException(
                            "Mensajero no encontrado"
                    ));
        }
    }
}