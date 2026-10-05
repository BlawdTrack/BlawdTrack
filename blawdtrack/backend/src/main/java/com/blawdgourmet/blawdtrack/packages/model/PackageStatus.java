package com.blawdgourmet.blawdtrack.packages.model;

/**
 * Estados posibles de un paquete/envío.
 */
public enum PackageStatus {
    PENDING("PENDIENTE"),
    ASSIGNED("ASIGNADO"),
    IN_TRANSIT("EN_TRANSITO"),
    OUT_FOR_DELIVERY("EN_REPARTO"),
    DELIVERED("ENTREGADO"),
    FAILED_DELIVERY("ENTREGA_FALLIDA"),
    RETURNED("DEVUELTO"),
    CANCELLED("CANCELADO");

    private final String code;

    PackageStatus(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}