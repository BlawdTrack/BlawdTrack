package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;

/**
 * Servicio para gestionar cambios de estado de paquetes con auditoría.
 */
public interface PackageStatusService {

    /**
     * Cambia el estado de un paquete y registra la auditoría.
     *
     * @param pkg           paquete a actualizar
     * @param newStatus     nuevo estado
     * @param actor         usuario autenticado que realiza el cambio
     * @param details       detalle opcional del cambio
     * @return el paquete actualizado
     */
    DeliveryPackage changeStatus(DeliveryPackage pkg, PackageStatus newStatus,
            com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser actor, String details);
}