package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.packages.dto.ImportedPackage;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

/** Convierte el contrato de importación en una entidad lista para persistir. */
public interface DeliveryPackageMapper {

    DeliveryPackage toEntity(ImportedPackage packageData);
}
