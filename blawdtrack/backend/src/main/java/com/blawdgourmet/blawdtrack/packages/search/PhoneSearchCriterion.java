package com.blawdgourmet.blawdtrack.packages.search;

import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;

@Component
public class PhoneSearchCriterion extends AbstractTextFieldSearchCriterion {

    private static final Pattern PHONE_SEARCH_INPUT = Pattern.compile("%([+0-9 -]+)%");

    public PhoneSearchCriterion() {
        super(PackageSearchFields.PHONE);
    }

    @Override
    public Specification<DeliveryPackage> toSpecification(PackageSearchTerm term) {
        return (root, query, builder) -> {
            if (term == null || term.likePattern() == null) {
                return builder.conjunction();
            }

            Expression<String> phone = builder.lower(root.get(PackageSearchFields.PHONE));
            Predicate textMatch = builder.like(phone, term.likePattern().toLowerCase(Locale.ROOT),
                    PackageSearchTermNormalizer.ESCAPE_CHARACTER);

            Matcher matcher = PHONE_SEARCH_INPUT.matcher(term.likePattern());
            if (!matcher.matches()) {
                return textMatch;
            }
            String digits = matcher.group(1).replaceAll("[^0-9]", "");
            if (digits.isEmpty()) {
                return textMatch;
            }

            Expression<String> normalizedPhone = replace(builder, phone, "-", "");
            normalizedPhone = replace(builder, normalizedPhone, " ", "");
            normalizedPhone = replace(builder, normalizedPhone, "+", "");
            return builder.or(textMatch, builder.like(normalizedPhone, "%" + digits + "%"));
        };
    }

    private Expression<String> replace(jakarta.persistence.criteria.CriteriaBuilder builder,
            Expression<String> expression, String target, String replacement) {
        return builder.function("replace", String.class, expression,
                builder.literal(target), builder.literal(replacement));
    }
}