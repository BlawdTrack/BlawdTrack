package com.blawdgourmet.blawdtrack.audit.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface AuditService {
    void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado);

    void registrarEliminacionAdministrador(AuthenticatedUser actor, User administradorEliminado);
}
