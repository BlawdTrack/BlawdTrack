package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;

/**
 * Registro de auditoría de la eliminación de paquetes (HU-012 / T03). Se almacena en la tabla
 * compartida {@code auditorias} con la acción {@code ELIMINAR_PAQUETE}.
 */
public interface PackageDeletionAuditService {

    /**
     * Registra la eliminación de un paquete en la transacción del borrado. El paquete ya no existirá,
     * por lo que el registro no lo referencia: guarda su número de envío y su estado en el detalle.
     * La fecha y hora las fija el servidor.
     *
     * @param actor          administrador autenticado que eliminó el paquete (tomado del SecurityContext)
     * @param shipmentNumber número de envío del paquete eliminado
     * @param status         estado que tenía el paquete al eliminarse
     * @throws org.springframework.transaction.IllegalTransactionStateException
     *         si no hay una transacción activa
     */
    void registerDeletion(AuthenticatedUser actor, String shipmentNumber, PackageStatus status);
}
