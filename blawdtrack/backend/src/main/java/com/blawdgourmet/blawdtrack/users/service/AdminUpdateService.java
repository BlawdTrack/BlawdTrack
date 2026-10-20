package com.blawdgourmet.blawdtrack.users.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.dto.AdminDetailResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminUpdateRequest;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Actualización de administradores por el Super Usuario (HU-007): nombre, correo, estado de acceso y contraseña.
 * Cambiar el estado o la contraseña cierra la sesión abierta del administrador, y todo cambio deja rastro en la
 * bitácora (ver {@link AdminUpdateAuditor}).
 */
@Service
@RequiredArgsConstructor
public class AdminUpdateService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminUniquenessValidator adminUniquenessValidator;
    private final AdminLookup lookup;
    private final AdminUpdateAuditor auditor;

    @Transactional
    public AdminDetailResponse updateAdministrator(
            DocumentType documentType, String documentNumber, AdminUpdateRequest request, AuthenticatedUser actor) {
        User admin = lookup.findSalesAdministrator(documentType, documentNumber);

        boolean emailChanges = request.email() != null && !request.email().equalsIgnoreCase(admin.getEmail());
        if (emailChanges) {
            adminUniquenessValidator.validateEmailChange(admin.getId(), request.email());
        }

        List<String> profileFields = new ArrayList<>();
        if (request.fullName() != null && !request.fullName().equals(admin.getFullName())) {
            admin.setFullName(request.fullName());
            profileFields.add("nombre");
        }
        if (emailChanges) {
            admin.setEmail(request.email());
            profileFields.add("correo");
        }

        // Cambiar el estado o la contraseña sube tokenVersion: la sesión abierta deja de ser válida en su siguiente
        // solicitud. Repetir el mismo estado no cambia nada ni deja rastro.
        boolean statusChanges = request.status() != null && request.status() != admin.getStatus();
        if (statusChanges) {
            admin.changeStatus(request.status());
        }
        boolean passwordChanges = request.password() != null;
        if (passwordChanges) {
            admin.changePassword(passwordEncoder.encode(request.password()));
        }

        userRepository.saveAndFlush(admin);

        auditor.profileChanged(actor, admin, profileFields);
        if (statusChanges) {
            auditor.statusChanged(actor, admin);
        }
        if (passwordChanges) {
            auditor.passwordChanged(actor, admin);
        }

        return AdminDetailResponse.from(admin);
    }
}
