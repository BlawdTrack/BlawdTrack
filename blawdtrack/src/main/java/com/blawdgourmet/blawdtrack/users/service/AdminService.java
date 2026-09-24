package com.blawdgourmet.blawdtrack.users.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.constant.DocumentType;
import com.blawdgourmet.blawdtrack.users.dto.AdminEliminacionElegibilidadResponse;
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

    AdminEliminacionElegibilidadResponse validarElegibilidadEliminacion(DocumentType documentType, String documentNumber);
}
