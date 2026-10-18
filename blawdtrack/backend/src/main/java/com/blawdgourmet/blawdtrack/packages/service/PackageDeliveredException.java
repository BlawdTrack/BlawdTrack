package com.blawdgourmet.blawdtrack.packages.service;

/**
 * El paquete ya fue entregado y no puede eliminarse en ninguna circunstancia (HU-012).
 * Se responde 409 {@code PAQUETE_ENTREGADO}.
 */
public class PackageDeliveredException extends RuntimeException {
    public PackageDeliveredException(String shipmentNumber) {
        super("El paquete " + shipmentNumber + " ya fue entregado y no puede eliminarse.");
    }
}
