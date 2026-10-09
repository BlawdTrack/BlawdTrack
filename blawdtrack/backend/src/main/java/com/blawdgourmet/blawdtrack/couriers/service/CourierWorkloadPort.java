package com.blawdgourmet.blawdtrack.couriers.service;

/**
 * Consulta la carga de trabajo de un mensajero.
 */
public interface CourierWorkloadPort {

    /**
     * Indica si el mensajero tiene paquetes o entregas asignados en un estado operativo activo,
     * es decir, cualquier estado distinto de Entregado y No entregado.
     *
     * @param courierId id del {@code Courier} (mensajeros.id); no es el id de usuario ni la cédula
     * @return {@code true} si tiene asignaciones activas; {@code false} en caso contrario
     */
    boolean hasActiveAssignments(Long courierId);
}
