package com.blawdgourmet.blawdtrack.couriers.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CourierDeactivationValidator {
    private final CourierWorkloadPort workload;

    public void validateCanDeactivate(Long courierId) {
        if (workload.hasActiveAssignments(courierId)) {
            throw new CourierHasActiveAssignmentsException(
                    "El mensajero tiene paquetes o entregas pendientes y no puede desactivarse");
        }
    }
}
