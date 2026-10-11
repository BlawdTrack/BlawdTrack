package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

/**
 * Criterio base para búsquedas textuales sobre un único campo de la entidad de paquetes.
 * Centraliza la búsqueda por prefijo; el collation de la base de datos resuelve mayúsculas y tildes.
 */
public abstract class AbstractTextFieldSearchCriterion implements PackageSearchCriterion {

    private final String fieldName;

    protected AbstractTextFieldSearchCriterion(String fieldName) {
        this.fieldName = fieldName;
    }

    @Override
    public Specification<DeliveryPackage> toSpecification(PackageSearchTerm term) {
        return (root, query, builder) -> {
            if (term == null || term.likePattern() == null) {
                return builder.conjunction();
            }
                return builder.like(root.get(fieldName), term.likePattern(),
                    PackageSearchTermNormalizer.ESCAPE_CHARACTER);
        };
    }
}
