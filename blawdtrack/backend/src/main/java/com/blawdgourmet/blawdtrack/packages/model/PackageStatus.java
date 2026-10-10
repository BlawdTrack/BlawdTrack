package com.blawdgourmet.blawdtrack.packages.model;

/** Estados soportados para el ciclo de vida de un paquete. */
public enum PackageStatus {
    PENDING,
    ASSIGNED,
    SHIPPED,
    IN_TRANSIT,
    DELIVERED,
    NOT_DELIVERED
}
