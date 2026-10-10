package com.blawdgourmet.blawdtrack.packages.matching;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

class PartialMatchSpecificationFactoryTest {

    @Test
    void blankTermReturnsEmptySpecification() {
        PartialMatchSpecificationFactory factory = new PartialMatchSpecificationFactory(
                mock(PartialMatchStrategy.class), new PartialMatchTermParser());

        assertThat(factory.create("  ", List.of(PartialMatchField.text("name")))).isEmpty();
    }

    @Test
    void rejectsNullOrEmptyFields() {
        PartialMatchSpecificationFactory factory = new PartialMatchSpecificationFactory(
                mock(PartialMatchStrategy.class), new PartialMatchTermParser());

        assertThatThrownBy(() -> factory.create("term", List.of()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> factory.create("term", null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void usesAnInjectedStrategyOncePerTokenAndField() {
        PartialMatchStrategy strategy = mock(PartialMatchStrategy.class);
        PartialMatchSpecificationFactory factory = new PartialMatchSpecificationFactory(
                strategy, new PartialMatchTermParser());
        CriteriaBuilder cb = mock(CriteriaBuilder.class);
        @SuppressWarnings("unchecked")
        Root<Object> root = mock(Root.class);
        @SuppressWarnings("unchecked")
        CriteriaQuery<Object> query = mock(CriteriaQuery.class);
        @SuppressWarnings("unchecked")
        Path<Object> path = mock(Path.class);
        Predicate predicate = mock(Predicate.class);
        when(root.get(anyString())).thenReturn(path);
        when(strategy.buildPredicate(any(), same(cb), any(), any())).thenReturn(predicate);
        when(cb.or(any(Predicate.class), any(Predicate.class))).thenReturn(predicate);
        when(cb.and(any(Predicate.class), any(Predicate.class))).thenReturn(predicate);

        Specification<Object> specification = factory.create("uno dos", List.of(
                PartialMatchField.text("name"), PartialMatchField.phone("phone"))).orElseThrow();
        specification.toPredicate(root, query, cb);

        verify(strategy, times(4)).buildPredicate(any(), same(cb), any(), any());
    }
}