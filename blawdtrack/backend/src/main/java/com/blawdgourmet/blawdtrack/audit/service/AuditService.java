package com.blawdgourmet.blawdtrack.audit.service;

import com.blawdgourmet.blawdtrack.audit.model.AuditAction;
import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.users.model.User;

public interface AuditService {
    void registrarCreacionAdministrador(AuthenticatedUser actor, User administradorCreado);

    void registrarEliminacionAdministrador(AuthenticatedUser actor, User administradorEliminado);

    /**
     * Registra la eliminación de un paquete (HU-012) en la misma transacción del borrado. El paquete
     * ya no existirá, por lo que el registro no referencia al paquete: guarda su número de envío y su
     * estado como texto en el detalle. La fecha y hora las fija el servidor.
     *
     * @param actor          administrador autenticado que elimina el paquete
     * @param shipmentNumber número de envío del paquete eliminado
     * @param status         estado que tenía el paquete al eliminarse
     * @throws org.springframework.transaction.IllegalTransactionStateException
     *         si no hay una transacción activa
     */
    void registrarEliminacionPaquete(AuthenticatedUser actor, String shipmentNumber, PackageStatus status);
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
