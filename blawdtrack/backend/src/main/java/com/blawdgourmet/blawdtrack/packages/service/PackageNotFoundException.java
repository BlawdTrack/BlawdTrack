package com.blawdgourmet.blawdtrack.packages.service;

/**
 * Excepción lanzada cuando no se encuentra un paquete con el número de envío especificado.
 */
public class PackageNotFoundException extends RuntimeException {

    public PackageNotFoundException(String shipmentNumber) {
        super("Paquete no encontrado con número de envío: " + shipmentNumber);
    }
}