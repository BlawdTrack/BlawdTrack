package com.blawdgourmet.blawdtrack.packages.repository;

import com.blawdgourmet.blawdtrack.packages.model.Package;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acceso a los paquetes/envíos (tabla {@code paquetes}).
 */
public interface PackageRepository extends JpaRepository<Package, Long> {

    /**
     * Busca un paquete por su número de envío, cargando las relaciones necesarias.
     */
    @EntityGraph(attributePaths = {"assignedCourier", "assignedCourier.user", "createdBy", "createdBy.role"})
    Optional<Package> findByShipmentNumber(String shipmentNumber);

    /**
     * Verifica si existe un paquete con el número de envío dado.
     */
    boolean existsByShipmentNumber(String shipmentNumber);
}