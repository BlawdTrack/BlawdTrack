package com.blawdgourmet.blawdtrack.users.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.common.model.DocumentType;
import com.blawdgourmet.blawdtrack.users.dto.AdminAuditLogResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDetailResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionEligibilityResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminDeletionResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationRequest;
import com.blawdgourmet.blawdtrack.users.dto.AdminRegistrationResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminSummaryResponse;
import com.blawdgourmet.blawdtrack.users.dto.AdminUpdateRequest;

public interface AdminService {

    /**
     * Lists every "Sales Administrator" user, including their approximate
     * session state, for the deletion screen (HU-008).
     */
    List<AdminSummaryResponse> list();

    /**
     * Registers a new user with the "Sales Administrator" role (HU-006 / CU-006).
     *
     * @param request registration form data, already validated by Bean Validation.
     * @param actor   authenticated Super User executing the creation (for auditing).
     */
    AdminRegistrationResponse registrarAdministrador(AdminRegistrationRequest request, AuthenticatedUser actor);

    /**
     * Finds the "Sales Administrator" to modify by identity document and confirms they exist (HU-007 / T01).
     *
     * @param documentType   document type of the administrator to find.
     * @param documentNumber document number of the administrator to find.
     * @return the administrator's profile, without credentials.
     * @throws AdminNotFoundException if no Sales Administrator matches the given document (a user with another
     *                                role is not found either).
     */
    AdminDetailResponse findAdministrator(DocumentType documentType, String documentNumber);

    /**
     * Applies the requested changes (full name, email, password and/or access status) to a "Sales Administrator"
     * (HU-007 / T02). Changing the status or the password closes the administrator's active session at once
     * (it raises {@code tokenVersion}), and every change leaves a trace in the audit log; the password is never logged.
     *
     * @param documentType   document type of the administrator to modify.
     * @param documentNumber document number of the administrator to modify.
     * @param request        fields to change; absent fields are left as they are.
     * @param actor          authenticated Super User executing the change (for auditing).
     * @return the updated profile.
     * @throws AdminNotFoundException if no Sales Administrator matches the given document.
     */
    AdminDetailResponse updateAdministrator(
            DocumentType documentType, String documentNumber, AdminUpdateRequest request, AuthenticatedUser actor);

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

    /**
     * Deletes a "Sales Administrator" and records the audit log (HU-008 / T02).
     *
     * @param documentType   document type of the administrator to delete.
     * @param documentNumber document number of the administrator to delete.
     * @param actor          authenticated Super User executing the deletion.
     * @return confirmation response.
     */
    AdminDeletionResponse deleteAdministrator(
            DocumentType documentType, String documentNumber, AuthenticatedUser actor);

    /**
     * Lists the audit trail of ONE "Sales Administrator" (creation, modifications, activations, deactivations and
     * password changes), newest first (HU-007). Their deletion is not included: it leaves no administrator to ask about,
     * and shows up in {@link #getAuditLog()}.
     *
     * @throws AdminNotFoundException if no Sales Administrator matches the given document.
     */
    List<AdminAuditLogResponse> getAdministratorHistory(DocumentType documentType, String documentNumber);

    /**
     * Lists the audit trail of administrator creations and deletions (HU-006 / T06),
     * newest first.
     */
    List<AdminAuditLogResponse> getAuditLog();
}
