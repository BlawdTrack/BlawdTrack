package com.blawdgourmet.blawdtrack.couriers.service;

import org.springframework.stereotype.Component;

/**
 * Implementación provisional de {@link CourierWorkloadPort}. El módulo de paquetes aún no existe,
 * por lo que siempre responde que el mensajero no tiene asignaciones activas.
 *
 * <p>Limitación temporal: mientras esta clase esté activa, la validación de paquetes pendientes
 * no impide desactivar a un mensajero con entregas pendientes. La implementación real del puerto
 * queda pendiente de la Task #301 (T12, HU-010, Sprint 2), que debe eliminar esta clase y su test.
 */
@Component
public class ProvisionalCourierWorkloadPort implements CourierWorkloadPort {

    @Override
    public boolean hasActiveAssignments(Long courierId) {
        return false;
    }
}
