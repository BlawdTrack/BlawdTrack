package com.blawdgourmet.blawdtrack.packages.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

public interface DeliveryPackageSearchRepository
        extends JpaRepository<DeliveryPackage, Long>, JpaSpecificationExecutor<DeliveryPackage> {
}