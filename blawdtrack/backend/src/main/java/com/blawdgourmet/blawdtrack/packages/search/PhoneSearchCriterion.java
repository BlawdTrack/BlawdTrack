package com.blawdgourmet.blawdtrack.packages.search;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

@Component
public class PhoneSearchCriterion implements PackageSearchCriterion {

    @Override
    public Specification<DeliveryPackage> toSpecification(PackageSearchTerm term) {
        return (root, query, builder) -> {
            if (term == null || term.likePattern() == null) {
                return builder.conjunction();
            }

            Expression<String> phone = builder.lower(root.get("phone"));
            Predicate formattedPhone = builder.like(
                    phone, term.likePattern(), PackageSearchTermNormalizer.ESCAPE_CHARACTER);
            if (!term.hasDigitsPattern()) {
                return formattedPhone;
            }

            Expression<String> withoutHyphens = replace(builder, phone, "-", "");
            Expression<String> withoutSpaces = replace(builder, withoutHyphens, " ", "");
            Expression<String> normalizedPhone = replace(builder, withoutSpaces, "+", "");
            Predicate digitsPhone = builder.like(normalizedPhone, term.digitsPattern());
            return builder.or(formattedPhone, digitsPhone);
        };
    }

    private Expression<String> replace(
            CriteriaBuilder builder, Expression<String> expression, String target, String replacement) {
        return builder.function("replace", String.class, expression,
                builder.literal(target), builder.literal(replacement));
    }
}