package com.blawdgourmet.blawdtrack.packages.matching;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

/**
 * Construye una especificación que aplica AND entre palabras y OR entre campos.
 * La tolerancia a tildes de los datos depende del collation MySQL 8
 * {@code utf8mb4_0900_ai_ci}; H2 distingue tildes, así que allí solo se garantiza
 * coincidencia cuando los datos usan una de las variantes del término. No se implementa
 * tolerancia a errores de tipeo (Levenshtein/trigramas), ya que MySQL no ofrece una
 * función portable; una estrategia futura basada en FULLTEXT puede añadirla.
 */
@Component
@RequiredArgsConstructor
public class PartialMatchSpecificationFactory {

    private final PartialMatchStrategy strategy;
    private final PartialMatchTermParser parser;

    public <T> Optional<Specification<T>> create(String rawTerm, List<PartialMatchField> fields) {
        if (fields == null || fields.isEmpty()) {
            throw new IllegalArgumentException("Se requiere al menos un campo de búsqueda");
        }

        List<PartialMatchToken> tokens = parser.parse(rawTerm);
        if (tokens.isEmpty()) {
            return Optional.empty();
        }

        Specification<T> specification = tokens.stream()
                .map(token -> (Specification<T>) (root, query, cb) -> {
                    List<Predicate> predicates = fields.stream()
                            .map(field -> strategy.buildPredicate(root.get(field.attributeName()), cb, field, token))
                            .toList();
                    return predicates.stream().reduce(cb::or).orElseGet(cb::disjunction);
                })
                .reduce(Specification::and)
                .orElseThrow();
        return Optional.of(specification);
    }
}