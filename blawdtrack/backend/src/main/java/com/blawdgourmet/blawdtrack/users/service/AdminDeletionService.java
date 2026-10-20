package com.blawdgourmet.blawdtrack.users.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionResponse;
import com.blawdgourmet.blawdtrack.users.model.User;
import com.blawdgourmet.blawdtrack.users.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/** Eliminación de administradores (HU-008): la verificación previa y el borrado con su auditoría. */
@Service
@RequiredArgsConstructor
public class AdminDeletionService {

    private final UserRepository userRepository;
    private final UserAuditTrail auditTrail;
    private final UserRelatedRecordsCleaner relatedRecordsCleaner;
    private final AdminLookup lookup;
    private final AdminSessionPolicy sessionPolicy;

    @Transactional(readOnly = true)
    public AdminDeletionEligibilityResponse validateDeletionEligibility(
            DocumentType documentType, String documentNumber) {
        User admin = lookup.findSalesAdministrator(documentType, documentNumber);

        boolean hasActiveSession = sessionPolicy.hasActiveSession(admin);
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
        auditTrail.adminDeleted(actor, user);
        relatedRecordsCleaner.removeFor(user.getId());
        userRepository.delete(user);
        userRepository.flush();

        return new AdminDeletionResponse("Administrador eliminado correctamente.");
    }
}
