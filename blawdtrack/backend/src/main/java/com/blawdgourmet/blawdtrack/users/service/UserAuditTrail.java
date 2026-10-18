package com.blawdgourmet.blawdtrack.users.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;

/**
 * Puerto por el que `users` deja constancia de lo que hace sobre las cuentas, sin conocer cómo ni dónde se
 * guarda. El módulo de auditoría lo implementa. Cada método se ejecuta en la transacción del cambio que lo
 * origina, de modo que la traza se confirma o se revierte junto con él.
 */
public interface UserAuditTrail {

    void adminCreated(AuthenticatedUser actor, User admin);

    void adminDeleted(AuthenticatedUser actor, User admin);

    void adminUpdated(AuthenticatedUser actor, User admin, String details);

    void adminActivated(AuthenticatedUser actor, User admin, String details);

    void adminDeactivated(AuthenticatedUser actor, User admin, String details);

    void adminPasswordChanged(AuthenticatedUser actor, User admin, String details);

    void permissionsUpdated(AuthenticatedUser actor, User affected, String details);

    void permissionsReset(AuthenticatedUser actor, User affected, String details);
}
