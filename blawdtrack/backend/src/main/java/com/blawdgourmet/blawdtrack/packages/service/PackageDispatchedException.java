package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;

/**
 * El paquete ya fue despachado (Enviado, En tránsito o No entregado) y no puede eliminarse (HU-012).
 * Se responde 409 {@code PAQUETE_DESPACHADO}.
 */
public class PackageDispatchedException extends RuntimeException {
    public PackageDispatchedException(String shipmentNumber, PackageStatus status) {
        super("El paquete " + shipmentNumber + " ya fue despachado (estado: " + status.getCode()
                + ") y no puede eliminarse.");
    }
}
