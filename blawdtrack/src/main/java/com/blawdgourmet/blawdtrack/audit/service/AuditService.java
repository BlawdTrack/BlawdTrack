package com.blawdgourmet.blawdtrack.audit.service;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface AuditService {
    void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado);

    /**
     * Registra una acción auditable en la misma transacción del cambio que la origina.
     *
     * @param action   acción realizada (no nula)
     * @param actor    usuario autenticado que ejecuta la acción (no nulo)
     * @param affected usuario afectado por la acción (no nulo)
     * @param details  descripción opcional (puede ser nula); se recorta a 500 caracteres
     * @throws org.springframework.transaction.IllegalTransactionStateException
     *         si no hay una transacción activa
     */
    void logAction(AuditAction action, AuthenticatedUser actor, User affected, String details);
}
