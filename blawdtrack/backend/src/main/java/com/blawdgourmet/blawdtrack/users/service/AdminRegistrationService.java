package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.exception.BusinessConfigurationException;
import com.blawdgourmet.blawdtrack.common.exception.DuplicateResourceException;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.common.security.TemporaryPasswordGenerator;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.validation.DocumentNormalizer;

import lombok.RequiredArgsConstructor;

/**
 * Registro de administradores (HU-006 / CU-006):
 * - Ningún campo puede quedar vacío (se valida mediante Bean Validation en el DTO).
 * - La cédula debe ser única y tener un formato válido.
 * - El correo debe ser único.
 * - La contraseña temporal la genera el sistema, se cifra antes de persistirse y se envía por correo al
 *   administrador una vez confirmada la transacción.
 * - El usuario se crea con el rol de "Administrador de Ventas".
 * - La creación queda registrada en el historial de auditoría.
 */
@Service
@RequiredArgsConstructor
public class AdminRegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAuditTrail auditTrail;
    private final AdminUniquenessValidator adminUniquenessValidator;
    private final TemporaryPasswordGenerator temporaryPasswords;
    private final ApplicationEventPublisher events;

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

        auditTrail.adminCreated(actor, administradorGuardado);

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
}
