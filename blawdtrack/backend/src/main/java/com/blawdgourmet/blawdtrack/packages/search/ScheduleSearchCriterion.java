package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

import jakarta.persistence.criteria.Expression;

@Component
public class ScheduleSearchCriterion implements PackageSearchCriterion {

    @Override
    public Specification<DeliveryPackage> toSpecification(PackageSearchTerm term) {
        return (root, query, builder) -> {
            if (term == null || term.likePattern() == null) {
                return builder.conjunction();
            }
            Expression<String> field = builder.lower(root.get("schedule"));
            return builder.like(field, term.likePattern(), PackageSearchTermNormalizer.ESCAPE_CHARACTER);
        };
    }
}