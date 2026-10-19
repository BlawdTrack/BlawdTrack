package com.blawdgourmet.blawdtrack.packages.repository;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Acceso a paquetes/envíos (tabla {@code paquetes}).
 */
public interface DeliveryPackageRepository extends JpaRepository<DeliveryPackage, Long> {

    /**
     * Busca un paquete por su número de envío exacto (ya normalizado: recortado y en mayúsculas),
     * cargando las relaciones necesarias.
     */
    @EntityGraph(attributePaths = {
            "assignedCourier",
            "assignedCourier.user",
            "assignedCourier.user.role",
            "items"
    })
    Optional<DeliveryPackage> findByShipmentNumber(String shipmentNumber);

    /**
     * Indica si el mensajero (id de {@code mensajeros}, no el del usuario) tiene algún paquete asignado cuyo estado no
     * está entre los excluidos; se usa para saber si tiene trabajo pendiente.
     */
    boolean existsByAssignedCourierIdAndStatusNotIn(Long courierId, Collection<PackageStatus> statuses);

    @Query("select upper(p.shipmentNumber) from DeliveryPackage p "
            + "where upper(p.shipmentNumber) in :shipmentNumbers")
    Set<String> findExistingShipmentNumbers(
            @Param("shipmentNumbers") Collection<String> shipmentNumbers);
}
