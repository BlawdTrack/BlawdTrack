package com.blawdgourmet.blawdtrack.couriers.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Regla de negocio de HU-005: un mensajero solo puede desactivarse si no tiene paquetes ni entregas
 * pendientes. La consulta se delega en {@link CourierWorkloadPort}.
 */
@Component
@RequiredArgsConstructor
public class CourierDeactivationValidator {
    private final CourierWorkloadPort workload;

    /**
     * @param courierId id del perfil de mensajero
     * @throws CourierHasActiveAssignmentsException si tiene asignaciones activas
     */
    public void validateCanDeactivate(Long courierId) {
        if (workload.hasActiveAssignments(courierId)) {
            throw new CourierHasActiveAssignmentsException(
                    "El mensajero tiene paquetes o entregas pendientes y no puede desactivarse");
        }
    }
}
