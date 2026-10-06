package com.blawdgourmet.blawdtrack.packages.matching;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

/**
 * Define una comparación parcial que debe funcionar para todos los tipos de campo,
 * devolver siempre un predicado no nulo y no fallar ante valores nulos o caracteres especiales.
 */
public interface PartialMatchStrategy {

    Predicate buildPredicate(Path<String> path, CriteriaBuilder cb, PartialMatchField field,
            PartialMatchToken token);
}