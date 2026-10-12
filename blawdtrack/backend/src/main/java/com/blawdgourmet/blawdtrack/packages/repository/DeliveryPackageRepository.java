package com.blawdgourmet.blawdtrack.packages.repository;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acceso a paquetes/envíos (tabla {@code paquetes}).
 */
public interface DeliveryPackageRepository extends JpaRepository<DeliveryPackage, Long> {

    /**
     * Busca un paquete por su número de envío, cargando las relaciones necesarias.
     */
    @EntityGraph(attributePaths = {
            "assignedCourier",
            "assignedCourier.user",
            "assignedCourier.user.role",
            "items"
    })
    Optional<DeliveryPackage> findByShipmentNumber(String shipmentNumber);
}
