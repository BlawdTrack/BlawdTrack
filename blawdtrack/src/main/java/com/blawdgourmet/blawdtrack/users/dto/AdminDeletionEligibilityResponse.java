package com.blawdgourmet.blawdtrack.users.dto;

import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

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
