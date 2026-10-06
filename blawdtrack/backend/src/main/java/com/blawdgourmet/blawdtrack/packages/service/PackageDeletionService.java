package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;

/** Eliminación de paquetes por parte del Administrador de Ventas (HU-012). */
public interface PackageDeletionService {

    /**
     * Elimina el paquete con el número de envío indicado, solo si está Pendiente o Asignado, y registra
     * la auditoría en la misma transacción.
     *
     * @param shipmentNumber número de envío (se recorta y se pasa a mayúsculas antes de buscar)
     * @param actor          administrador autenticado que ejecuta la eliminación
     * @throws PackageNotFoundException   si no existe un paquete con ese número de envío
     * @throws PackageDeliveredException  si el paquete ya fue entregado
     * @throws PackageDispatchedException si el paquete ya fue despachado (Enviado, En tránsito o No entregado)
     */
    PackageDeletionResponse deletePackage(String shipmentNumber, AuthenticatedUser actor);
}
