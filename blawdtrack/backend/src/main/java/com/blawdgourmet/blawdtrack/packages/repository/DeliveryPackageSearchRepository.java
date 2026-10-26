package com.blawdgourmet.blawdtrack.packages.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

public interface DeliveryPackageSearchRepository
        extends JpaRepository<DeliveryPackage, Long>, JpaSpecificationExecutor<DeliveryPackage> {

    /** Una fila {estado, cantidad} por cada estado que tiene paquetes. */
    @Query("select p.status, count(p) from DeliveryPackage p group by p.status")
    List<Object[]> countGroupedByStatus();
}