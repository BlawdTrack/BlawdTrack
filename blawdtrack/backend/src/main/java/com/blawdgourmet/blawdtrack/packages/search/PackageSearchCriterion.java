package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

/**
 * Contrato para un criterio de búsqueda: debe devolver siempre una especificación no nula,
 * no lanzar excepciones ante campos nulos o caracteres especiales y no producir efectos secundarios.
 */
public interface PackageSearchCriterion {

    Specification<DeliveryPackage> toSpecification(PackageSearchTerm term);
}