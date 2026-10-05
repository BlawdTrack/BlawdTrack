package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

@Component
public class ShipmentNumberSearchCriterion implements PackageSearchCriterion {

    @Override
    public Specification<DeliveryPackage> toSpecification(PackageSearchTerm term) {
        return (root, query, builder) -> {
            if (term == null || term.likePattern() == null) {
                return builder.conjunction();
            }
            Expression<String> field = builder.lower(root.get("shipmentNumber"));
            return like(builder, field, term.likePattern());
        };
    }

    private Predicate like(CriteriaBuilder builder, Expression<String> field, String pattern) {
        return builder.like(field, pattern, PackageSearchTermNormalizer.ESCAPE_CHARACTER);
    }
}