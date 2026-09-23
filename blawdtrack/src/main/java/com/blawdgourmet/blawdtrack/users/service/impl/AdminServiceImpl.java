package com.blawdgourmet.blawdtrack.users.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.audit.service.AuditService;
import com.blawdgourmet.blawdtrack.common.exception.BusinessConfigurationException;
import com.blawdgourmet.blawdtrack.common.exception.DuplicateResourceException;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.model.Role;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.RoleRepository;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;
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

    @Override
    @Transactional
    public AdminRegistrationResponse registrarAdministrador(AdminRegistrationRequest request, AuthenticatedUser actor) {

        String cedula = normalizarDocumento(request.cedulaIdentidad());
        String correo = request.correoElectronico().trim();

        if (userRepository.existsByDocumentId(cedula)) {
            throw new DuplicateResourceException("CEDULA_DUPLICADA",
                    "The entered identity document is already associated with another registered user in the system.");
        }

        if (userRepository.existsByEmailIgnoreCase(correo)) {
            throw new DuplicateResourceException("CORREO_DUPLICADO",
                    "The email address entered is already registered in the system.");
        }

        Role rolAdministrador = roleRepository.findByName(RoleName.SALES_ADMIN)
                .orElseThrow(() -> new BusinessConfigurationException(
                        "The role '" + RoleName.SALES_ADMIN + "' is not registered in the roles table."));

        User nuevoAdministrador = User.builder()
                .documentId(cedula)
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
                administradorGuardado.getDocumentId(),
                administradorGuardado.getFullName(),
                administradorGuardado.getEmail(),
                administradorGuardado.getPhone(),
                administradorGuardado.getRole().getName(),
                administradorGuardado.getStatus()
                );
        }

        private String normalizarDocumento(String documento) {
                return documento.trim().replaceAll("[\\s-]", "");
        }
}
