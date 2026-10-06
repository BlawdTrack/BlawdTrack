package com.blawdgourmet.blawdtrack.packages.repository;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import java.util.Collection;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DeliveryPackageRepository extends JpaRepository<DeliveryPackage, Long> {

    /** Busca por número de envío exacto; el valor debe venir ya normalizado (recortado y en mayúsculas). */
    Optional<DeliveryPackage> findByShipmentNumber(String shipmentNumber);

    @Query("select upper(p.shipmentNumber) from DeliveryPackage p "
            + "where upper(p.shipmentNumber) in :shipmentNumbers")
    Set<String> findExistingShipmentNumbers(
            @Param("shipmentNumbers") Collection<String> shipmentNumbers);
}
