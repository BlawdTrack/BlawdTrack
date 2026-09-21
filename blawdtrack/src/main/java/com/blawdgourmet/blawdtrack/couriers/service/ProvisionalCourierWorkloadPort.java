package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.stereotype.Component;

/**
 * Implementación provisional de {@link CourierWorkloadPort}. El módulo de paquetes aún no existe,
 * por lo que siempre responde que el mensajero no tiene asignaciones activas.
 */
@Component
public class ProvisionalCourierWorkloadPort implements CourierWorkloadPort {

    @Override
    public boolean hasActiveAssignments(Long courierId) {
        return false;
    }
}
