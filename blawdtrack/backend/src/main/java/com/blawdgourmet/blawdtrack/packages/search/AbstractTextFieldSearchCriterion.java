package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

import jakarta.persistence.criteria.Expression;

/**
 * Criterio base para búsquedas textuales sobre un único campo de la entidad de paquetes.
 * Centraliza la lógica de normalización, escapado de caracteres especiales y comparación insensible a mayúsculas.
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
            Expression<String> field = builder.lower(root.get(fieldName));
            return builder.like(field, term.likePattern(), PackageSearchTermNormalizer.ESCAPE_CHARACTER);
        };
    }
}
