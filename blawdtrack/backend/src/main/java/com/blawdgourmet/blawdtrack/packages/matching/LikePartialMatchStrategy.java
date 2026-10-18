package com.blawdgourmet.blawdtrack.packages.matching;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

@Component
public class LikePartialMatchStrategy implements PartialMatchStrategy {

    @Override
    public Predicate buildPredicate(Path<String> path, CriteriaBuilder cb, PartialMatchField field,
            PartialMatchToken token) {
        List<Predicate> predicates = new ArrayList<>();
        Expression<String> lowerPath = cb.lower(path);
        for (String pattern : token.likePatterns()) {
            predicates.add(cb.like(lowerPath, pattern, PartialMatchTermParser.ESCAPE_CHARACTER));
        }

        if (field.type() == PartialMatchFieldType.PHONE && token.hasDigitsPattern()) {
            Expression<String> normalizedPhone = replace(cb, lowerPath, "-", "");
            normalizedPhone = replace(cb, normalizedPhone, " ", "");
            normalizedPhone = replace(cb, normalizedPhone, "+", "");
            predicates.add(cb.like(normalizedPhone, token.digitsPattern()));
        }

        return predicates.isEmpty()
                ? cb.disjunction()
                : predicates.stream().reduce(cb::or).orElseGet(cb::disjunction);
    }

    private Expression<String> replace(CriteriaBuilder cb, Expression<String> expression,
            String target, String replacement) {
        return cb.function("replace", String.class, expression,
                cb.literal(target), cb.literal(replacement));
    }
}