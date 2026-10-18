package com.blawdgourmet.blawdtrack.packages.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Estados del ciclo de vida de un paquete. El flujo es progresivo y no retrocede:
 * Pendiente → Asignado → Enviado → En tránsito → Entregado / No entregado.
 * El nombre de la constante se persiste en la columna "estado"; el código es la
 * representación en español para mensajes y reportes.
 *
 * <p>Cada estado declara si el paquete puede eliminarse (HU-012). Es una lista blanca:
 * un estado nuevo no es eliminable salvo que se indique explícitamente.
 */
@Getter
@RequiredArgsConstructor
public enum PackageStatus {

    PENDING("PENDIENTE", true),
    ASSIGNED("ASIGNADO", true),
    SHIPPED("ENVIADO", false),
    IN_TRANSIT("EN_TRANSITO", false),
    DELIVERED("ENTREGADO", false),
    NOT_DELIVERED("NO_ENTREGADO", false);

    private final String code;
    private final boolean deletable;

    /** Indica si un paquete en este estado puede eliminarse del sistema. */
    public boolean isDeletable() {
        return deletable;
    }
}
