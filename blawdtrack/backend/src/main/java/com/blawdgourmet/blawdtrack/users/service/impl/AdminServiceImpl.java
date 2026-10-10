package com.blawdgourmet.blawdtrack.users.service.impl;

import org.springframework.dao.DataIntegrityViolationException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.audit.repository.AuditLogRepository;
import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.exception.BusinessConfigurationException;
import com.blawdgourmet.blawdtrack.common.exception.DuplicateResourceException;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.common.security.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminSummaryResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;
import com.blawdgourmet.blawdtrack.users.service.AdminRegisteredEvent;
import com.blawdgourmet.blawdtrack.users.service.AdminService;
import com.blawdgourmet.blawdtrack.users.service.AdminUniquenessValidator;
import com.blawdgourmet.blawdtrack.users.service.UserRelatedRecordsCleaner;
import com.blawdgourmet.blawdtrack.users.validation.DocumentNormalizer;

/**
 * Implementa las reglas de negocio para HU-006 / CU-006 (Crear administrador):
 * - Ningún campo puede quedar vacío (se valida mediante Bean Validation en el DTO).
 * - La cédula debe ser única y tener un formato válido.
 * - El correo debe ser único.
 * - La contraseña temporal la genera el sistema, se cifra antes de persistirse y se envía por correo al
 *   administrador una vez confirmada la transacción.
 * - El usuario se crea con el rol de "Administrador de Ventas".
 * - La creación queda registrada en el historial de auditoría.
 */
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final AdminUniquenessValidator adminUniquenessValidator;
    private final UserRelatedRecordsCleaner relatedRecordsCleaner;
    private final AuditLogRepository auditLogRepository;
    private final TemporaryPasswordGenerator temporaryPasswords;
    private final ApplicationEventPublisher events;

    @Autowired
    public AdminServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService,
            AdminUniquenessValidator adminUniquenessValidator,
            AuditLogRepository auditLogRepository,
            UserRelatedRecordsCleaner relatedRecordsCleaner,
            TemporaryPasswordGenerator temporaryPasswords,
            ApplicationEventPublisher events) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.adminUniquenessValidator = adminUniquenessValidator;
        this.auditLogRepository = auditLogRepository;
        this.relatedRecordsCleaner = relatedRecordsCleaner;
        this.temporaryPasswords = temporaryPasswords;
        this.events = events;
    }

    @Value("${security.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Override
    @Transactional(readOnly = true)
    public List<AdminSummaryResponse> list() {
        return userRepository.findByRole_NameOrderByFullNameAsc(RoleName.SALES_ADMIN).stream()
                .map(admin -> new AdminSummaryResponse(
                        admin.getId(),
                        admin.getDocumentType(),
                        admin.getDocumentNumber(),
                        admin.getFullName(),
                        admin.getEmail(),
                        admin.getPhone(),
                        admin.getStatus(),
                        hasActiveSession(admin)
                ))
                .toList();
    }

    @Override
    @Transactional
    public AdminRegistrationResponse registrarAdministrador(AdminRegistrationRequest request, AuthenticatedUser actor) {
        DocumentType documentType = request.documentType();
        String documentNumber = DocumentNormalizer.normalize(documentType, request.documentNumber());
        String correo = request.correoElectronico().trim().toLowerCase();

        adminUniquenessValidator.validateNew(documentType, documentNumber, correo);

        Role rolAdministrador = roleRepository.findByName(RoleName.SALES_ADMIN)
                .orElseThrow(() -> new BusinessConfigurationException(
                        "The role '" + RoleName.SALES_ADMIN + "' is not registered in the roles table."));

        String temporaryPassword = temporaryPasswords.generate();

        User nuevoAdministrador = User.builder()
                .documentType(documentType)
                .documentNumber(documentNumber)
                .documentId(documentNumber)
                .fullName(request.nombreCompleto().trim())
                .email(correo)
                .passwordHash(passwordEncoder.encode(temporaryPassword))
                .phone(request.numeroTelefono().trim())
                .status(UserStatus.ACTIVE)
                .role(rolAdministrador)
                .build();

        User administradorGuardado;
        try {
            administradorGuardado = userRepository.saveAndFlush(nuevoAdministrador);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException(
                    "DUPLICATE_RESOURCE",
                    "A user with the same document or email already exists."
            );
        }

        auditService.registrarCreacionAdministrador(actor, administradorGuardado);

        events.publishEvent(new AdminRegisteredEvent(
                administradorGuardado.getId(),
                administradorGuardado.getEmail(),
                administradorGuardado.getFullName(),
                temporaryPassword
        ));

        return new AdminRegistrationResponse(
                administradorGuardado.getId(),
                administradorGuardado.getDocumentNumber(),
                administradorGuardado.getFullName(),
                administradorGuardado.getEmail(),
                administradorGuardado.getPhone(),
                administradorGuardado.getRole().getName(),
                administradorGuardado.getStatus()
        );
    }

    // "ELIMINAR_ADMINISTRADOR" mirrors AuditServiceImpl.ACCION_ELIMINAR_ADMINISTRADOR
    // (not in the AuditAction enum yet; that entry is written directly by
    // registrarEliminacionAdministrador instead of going through logAction).
    private static final List<String> ADMIN_AUDIT_ACTIONS = List.of(
            AuditAction.ADMIN_CREATED.getCode(), "ELIMINAR_ADMINISTRADOR");

    @Override
    @Transactional(readOnly = true)
    public List<AdminAuditLogResponse> getAuditLog() {
        return auditLogRepository.findByActionInOrderByTimestampDesc(ADMIN_AUDIT_ACTIONS).stream()
                .map(log -> new AdminAuditLogResponse(
                        log.getId(),
                        log.getAction(),
                        log.getActor().getFullName(),
                        log.getDetails(),
                        log.getTimestamp()
                ))
                .toList();
    }

    /**
     * Considera activa una sesión cuando el último inicio exitoso ocurrió dentro
     * de la vigencia configurada del token JWT ({@code jwtExpirationMs}).
     * <p>
     * Es una aproximación por expiración, no un estado real de sesión. El filtro
     * JWT sí valida en cada petición que el usuario exista, esté activo y que
     * {@code tokenVersion} coincida, pero hoy no existe un endpoint de logout y
     * nada incrementa {@code tokenVersion} ni limpia {@code lastLoginAt} al cerrar
     * sesión (solo {@code User.changeStatus} sube la versión, al desactivar a un
     * usuario). Por eso un administrador que cerró sesión sigue figurando como
     * "sesión activa" hasta que se cumple {@code jwtExpirationMs} desde su último
     * inicio. Corregirlo requiere un logout en el backend, que es una task aparte.
     */
    @Override
    @Transactional(readOnly = true)
    public AdminDeletionEligibilityResponse validateDeletionEligibility(
            DocumentType documentType, String documentNumber) {
        User admin = userRepository.findByDocumentTypeAndDocumentNumber(documentType, documentNumber)
                .filter(user -> user.getRole() != null
                        && RoleName.SALES_ADMIN.equals(user.getRole().getName()))
                .orElseThrow(() -> new AdminNotFoundException("Administrador no existente"));

        boolean hasActiveSession = hasActiveSession(admin);
        boolean eligible = true;
        String reason = hasActiveSession
                ? "El administrador tiene una sesión abierta; se cerrará automáticamente al eliminarlo."
                : null;

        return new AdminDeletionEligibilityResponse(
                admin.getId(),
                admin.getDocumentType(),
                admin.getDocumentNumber(),
                admin.getFullName(),
                admin.getStatus(),
                hasActiveSession,
                eligible,
                reason
        );
    }

    @Override
    @Transactional
    public AdminDeletionResponse deleteAdministrator(
            DocumentType documentType, String documentNumber, AuthenticatedUser actor) {

        User user = userRepository.findByDocumentTypeAndDocumentNumber(documentType, documentNumber)
                .orElseThrow(() -> new AdminNotFoundException("Administrador no existente"));

        if (user.getRole() == null || !RoleName.SALES_ADMIN.equals(user.getRole().getName())) {
            throw new AccessDeniedException("No se puede eliminar un usuario que no es Administrador de Ventas.");
        }

        // Una sesión abierta no bloquea la eliminación: al borrar al usuario el filtro JWT deja de
        // encontrarlo y su token se rechaza en la siguiente petición, lo que cierra la sesión.
        auditService.registrarEliminacionAdministrador(actor, user);
        relatedRecordsCleaner.removeFor(user.getId());
        userRepository.delete(user);
        userRepository.flush();

        return new AdminDeletionResponse("Administrador eliminado correctamente.");
    }

    private boolean hasActiveSession(User user) {
        return user.getLastLoginAt() != null
                && LocalDateTime.now().isBefore(user.getLastLoginAt().plus(jwtExpirationMs, ChronoUnit.MILLIS));
    }
}
