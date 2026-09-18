package com.blawdgourmet.blawdtrack.audit.service;

import com.blawdgourmet.blawdtrack.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface AuditService {
    void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado);
}
