package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

/**
 * Resultado de consultar si un administrador puede eliminarse (HU-008). {@code eligibleForDeletion} es
 * falso cuando tiene una sesión activa; en ese caso {@code ineligibilityReason} explica el motivo.
 */
public record AdminDeletionEligibilityResponse(
        Long id,
        DocumentType documentType,
        String documentNumber,
        String fullName,
        UserStatus status,
        boolean hasActiveSession,
        boolean eligibleForDeletion,
        String ineligibilityReason
) {
}
