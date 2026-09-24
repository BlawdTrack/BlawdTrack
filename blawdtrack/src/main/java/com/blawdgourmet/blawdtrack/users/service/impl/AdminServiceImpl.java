package com.blawdgourmet.blawdtrack.users.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.exception.BusinessConfigurationException;
import com.blawdgourmet.blawdtrack.common.exception.DuplicateResourceException;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminEliminacionElegibilidadResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
import com.blawdgourmet.blawdtrack.users.service.AdminNotFoundException;
import com.blawdgourmet.blawdtrack.users.service.AdminService;

import lombok.RequiredArgsConstructor;

/**
 * Implementa las reglas de negocio para HU-006 / CU-006 (Crear administrador):
 * - Ningún campo puede quedar vacío (se valida mediante Bean Validation en el DTO).
 * - La cédula debe ser única y tener un formato válido.
 * - El correo debe ser único.
 * - La contraseña se cifra antes de persistirse.
 * - El usuario se crea con el rol de "Administrador de Ventas".
 * - La creación queda registrada en el historial de auditoría.
 */
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

        @Value("${security.jwt.expiration-ms}")
        private long jwtExpirationMs;

    @Override
    @Transactional
    public AdminRegistrationResponse registrarAdministrador(AdminRegistrationRequest request, AuthenticatedUser actor) {

        String documentNumber = request.documentNumber().trim();
        String correo = request.correoElectronico().trim().toLowerCase();

        if (userRepository.existsByDocumentTypeAndDocumentNumber(request.documentType(), documentNumber)) {
            throw new DuplicateResourceException("DOCUMENTO_DUPLICADO",
                    "The entered identity document is already associated with another registered user in the system.");
        }

        if (userRepository.existsByEmail(correo)) {
            throw new DuplicateResourceException("DUPLICATE_EMAIL",
                    "The email address entered is already registered in the system.");
        }

        Role rolAdministrador = roleRepository.findByName(RoleName.SALES_ADMIN)
                .orElseThrow(() -> new BusinessConfigurationException(
                        "The role '" + RoleName.SALES_ADMIN + "' is not registered in the roles table."));

        User nuevoAdministrador = User.builder()
                .documentType(request.documentType())
                .documentNumber(documentNumber)
                .fullName(request.nombreCompleto().trim())
                .email(correo)
                .passwordHash(passwordEncoder.encode(request.contrasenaInicial()))
                .phone(request.numeroTelefono().trim())
                .status(UserStatus.ACTIVE)
                .role(rolAdministrador)
                .build();

        User administradorGuardado = userRepository.save(nuevoAdministrador);

        auditService.registrarCreacionAdministrador(actor, administradorGuardado);

        return new AdminRegistrationResponse(
                administradorGuardado.getId(),
                administradorGuardado.getDocumentType(),
                administradorGuardado.getDocumentNumber(),
                administradorGuardado.getFullName(),
                administradorGuardado.getEmail(),
                administradorGuardado.getPhone(),
                administradorGuardado.getRole().getName(),
                administradorGuardado.getStatus()
        );
    }

    /**
     * Considera activa una sesión cuando el último inicio exitoso ocurrió dentro
     * de la vigencia configurada del token JWT. Esta comprobación es deliberadamente
     * acotada: el filtro JWT actual no consulta la base de datos en cada petición;
     * esa revalidación corresponde a la task #75.
     */
    @Override
    @Transactional(readOnly = true)
    public AdminEliminacionElegibilidadResponse validarElegibilidadEliminacion(String documentNumber) {
        User administrador = Arrays.stream(DocumentType.values())
                .map(tipo -> userRepository.findByDocumentTypeAndDocumentNumber(tipo, documentNumber))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .findFirst()
                .filter(usuario -> usuario.getRole() != null
                        && RoleName.SALES_ADMIN.equals(usuario.getRole().getName()))
                .orElseThrow(() -> new AdminNotFoundException("Administrador no existente"));

        LocalDateTime ahora = LocalDateTime.now();
        boolean tieneSesionActiva = administrador.getLastLoginAt() != null
                && ahora.isBefore(administrador.getLastLoginAt().plus(jwtExpirationMs, ChronoUnit.MILLIS));
        boolean elegible = !tieneSesionActiva;
        String motivo = elegible
                ? null
                : "El administrador tiene una sesión activa. Debe cerrarla antes de eliminarlo.";

        return new AdminEliminacionElegibilidadResponse(
                administrador.getId(),
                administrador.getDocumentNumber(),
                administrador.getFullName(),
                administrador.getStatus(),
                tieneSesionActiva,
                elegible,
                motivo
        );
    }
}
