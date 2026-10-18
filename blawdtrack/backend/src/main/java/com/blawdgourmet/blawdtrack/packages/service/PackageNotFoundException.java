package com.blawdgourmet.blawdtrack.packages.service;

/**
 * No existe un paquete con el número de envío indicado (HU-012). Se responde 404
 * {@code PAQUETE_NO_ENCONTRADO}.
 */
public class PackageNotFoundException extends RuntimeException {
    public PackageNotFoundException(String shipmentNumber) {
        super("No existe un paquete con el número de envío " + shipmentNumber + ".");
    }
}
