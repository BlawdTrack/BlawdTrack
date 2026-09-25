package com.blawdgourmet.blawdtrack.users.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;

public interface AdminService {

    /**
     * Registers a new user with the "Sales Administrator" role (HU-006 / CU-006).
     *
     * @param request registration form data, already validated by Bean Validation.
     * @param actor   authenticated Super User executing the creation (for auditing).
     */
    AdminRegistrationResponse registrarAdministrador(AdminRegistrationRequest request, AuthenticatedUser actor);

    /**
     * Checks whether a "Sales Administrator" can be deleted (HU-008 / T01). An administrator is
     * eligible only when they have no active session.
     *
     * @param documentType   document type of the administrator to check.
     * @param documentNumber document number of the administrator to check.
     * @return eligibility result, with the reason when the administrator cannot be deleted.
     * @throws AdminNotFoundException if no Sales Administrator matches the given document.
     */
    AdminDeletionEligibilityResponse validateDeletionEligibility(DocumentType documentType, String documentNumber);
}
