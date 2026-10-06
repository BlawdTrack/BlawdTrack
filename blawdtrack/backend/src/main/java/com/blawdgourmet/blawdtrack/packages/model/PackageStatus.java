package com.blawdgourmet.blawdtrack.packages.model;

/**
 * Estados definidos para el flujo de paquetes del backlog.
 */
public enum PackageStatus {
    PENDING("PENDIENTE"),
    ASSIGNED("ASIGNADO"),
    SENT("ENVIADO"),
    IN_TRANSIT("EN_TRANSITO"),
    DELIVERED("ENTREGADO"),
    NOT_DELIVERED("NO_ENTREGADO");

    private final String code;

    PackageStatus(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
