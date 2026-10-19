package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.couriers.service.CourierWorkloadPort;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageRepository;
import java.util.EnumSet;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementación real de {@link CourierWorkloadPort} sobre el modelo de paquetes (HU-005 / Task 301): un mensajero
 * tiene asignaciones activas si algún paquete suyo está en un estado operativo, es decir, distinto de Entregado y
 * No entregado (Asignado, Enviado y En tránsito; un paquete Pendiente todavía no tiene mensajero).
 */
@Component
@RequiredArgsConstructor
public class PackageCourierWorkloadPort implements CourierWorkloadPort {

    /** Estados en los que el paquete ya terminó su recorrido y no pesa sobre el mensajero. */
    private static final Set<PackageStatus> FINISHED = EnumSet.of(PackageStatus.DELIVERED, PackageStatus.NOT_DELIVERED);

    private final DeliveryPackageRepository packages;

    @Override
    @Transactional(readOnly = true)
    public boolean hasActiveAssignments(Long courierId) {
        return packages.existsByAssignedCourierIdAndStatusNotIn(courierId, FINISHED);
    }
}
