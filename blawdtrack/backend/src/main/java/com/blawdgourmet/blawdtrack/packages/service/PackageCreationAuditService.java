package com.blawdgourmet.blawdtrack.packages.service;

import java.util.List;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

/**
 * Registro de auditoría del alta de paquetes (HU-013). Es el primer evento de la línea de tiempo de cada
 * paquete: se almacena en la tabla compartida {@code auditorias} con la acción {@code REGISTRAR_PAQUETE}, sin
 * estado anterior y con el estado inicial como estado nuevo.
 */
public interface PackageCreationAuditService {

    /**
     * Registra el alta de los paquetes en la transacción que los guardó. La fecha y hora las fija el servidor.
     *
     * @param actor    usuario autenticado que importó los paquetes
     * @param packages paquetes ya guardados (con su id asignado)
     * @throws org.springframework.transaction.IllegalTransactionStateException
     *         si no hay una transacción activa
     */
    void registerCreations(AuthenticatedUser actor, List<DeliveryPackage> packages);
}
