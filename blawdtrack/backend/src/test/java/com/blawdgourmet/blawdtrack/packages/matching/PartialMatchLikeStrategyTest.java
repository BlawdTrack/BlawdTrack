package com.blawdgourmet.blawdtrack.packages.matching;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.domain.Specification;

import com.blawdgourmet.testsupport.matching.PartialMatchSampleRow;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@DataJpaTest
@Import({PartialMatchTermParser.class, LikePartialMatchStrategy.class,
        PartialMatchSpecificationFactory.class, PartialMatchLikeStrategyTest.TestEntityConfiguration.class})
class PartialMatchLikeStrategyTest {

    private static final List<PartialMatchField> ALL_FIELDS = List.of(
            PartialMatchField.text("shipmentNumber"),
            PartialMatchField.text("orderNumber"),
            PartialMatchField.text("customerName"),
            PartialMatchField.text("address"),
            PartialMatchField.phone("phone"),
            PartialMatchField.text("schedule"));

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private PartialMatchSpecificationFactory factory;

    @Autowired
    private LikePartialMatchStrategy likeStrategy;

    @BeforeEach
    void insertSampleRows() {
        entityManager.persist(new PartialMatchSampleRow("ENV-00001", "SO-001", "Cliente Uno",
                "Del parque 100m norte, Escazu, San Jose, Costa Rica", "+506-8888-9999",
                "De 8 a 5, referencia 100%_real"));
        entityManager.persist(new PartialMatchSampleRow("ENV-00002", "SO-002", "Maria Rojas",
                "Heredia, Barva", "7110-0914", "De 9 a 6"));
        entityManager.persist(new PartialMatchSampleRow("ENV-00003", null, null, null, null, null));
    }

    @Test
    void findsFragmentsInEverySearchField() {
        assertThat(search("env-00", PartialMatchField.text("shipmentNumber"))).hasSize(3);
        assertThat(search("so-0", PartialMatchField.text("orderNumber"))).hasSize(2);
        assertThat(search("uno", PartialMatchField.text("customerName"))).hasSize(1);
        assertThat(search("parque", PartialMatchField.text("address"))).hasSize(1);
        assertThat(search("8888", PartialMatchField.phone("phone"))).hasSize(1);
        assertThat(search("8 a", PartialMatchField.text("schedule"))).hasSize(1);
    }

    @Test
    void matchesWithoutCaseSensitivityAndWithAccentVariants() {
        assertThat(search("CLIENTE", ALL_FIELDS)).hasSize(1);
        assertThat(search("escazú", ALL_FIELDS)).hasSize(1);
    }

    @Test
    void requiresEveryWordAndAllowsWordsInDifferentFieldsInAnyOrder() {
        assertThat(search("uno escazu", ALL_FIELDS)).hasSize(1);
        assertThat(search("escazu uno", ALL_FIELDS)).hasSize(1);
        assertThat(search("uno heredia", ALL_FIELDS)).isEmpty();
    }

    @Test
    void treatsLikeWildcardsAsLiteralText() {
        assertThat(search("%_", PartialMatchField.text("schedule"))).hasSize(1);
    }

    @Test
    void matchesPhoneDigitsAcrossCommonFormats() {
        assertThat(search("88889999", PartialMatchField.phone("phone"))).hasSize(1);
        assertThat(search("8888-9999", PartialMatchField.phone("phone"))).hasSize(1);
        assertThat(search("8888 9999", PartialMatchField.phone("phone"))).hasSize(1);
        assertThat(search("+506", PartialMatchField.phone("phone"))).hasSize(1);
    }

    @Test
    void toleratesNullColumnsAndReturnsNoMatchesWhenAppropriate() {
        assertThat(search("cliente", ALL_FIELDS)).hasSize(1);
        assertThat(search("dato-inexistente", ALL_FIELDS)).isEmpty();
    }

    @Test
    void ignoresWordsAfterTheFifthToken() {
        assertThat(search("cliente cliente cliente cliente cliente inexistente", ALL_FIELDS)).hasSize(1);
    }

    @Test
    void allStrategiesReturnPredicatesForEveryFieldTypeAndNullableColumns() {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<PartialMatchSampleRow> query = cb.createQuery(PartialMatchSampleRow.class);
        Root<PartialMatchSampleRow> root = query.from(PartialMatchSampleRow.class);
        PartialMatchToken specialToken = new PartialMatchToken(List.of("%!%!_%"), "%123%");
        List<PartialMatchStrategy> strategies = List.of(likeStrategy, new PartialMatchContractStrategy());

        for (PartialMatchStrategy strategy : strategies) {
            for (PartialMatchField field : List.of(
                    PartialMatchField.text("address"), PartialMatchField.phone("phone"))) {
                Predicate predicate = strategy.buildPredicate(root.get(field.attributeName()), cb, field, specialToken);
                assertThat(predicate).isNotNull();
            }
        }
    }

    private List<PartialMatchSampleRow> search(String term, PartialMatchField... fields) {
        return search(term, List.of(fields));
    }

    private List<PartialMatchSampleRow> search(String term, List<PartialMatchField> fields) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<PartialMatchSampleRow> query = cb.createQuery(PartialMatchSampleRow.class);
        Root<PartialMatchSampleRow> root = query.from(PartialMatchSampleRow.class);
        Specification<PartialMatchSampleRow> specification = factory
                .<PartialMatchSampleRow>create(term, fields).orElseThrow();
        query.select(root).where(specification.toPredicate(root, query, cb));
        return entityManager.createQuery(query).getResultList();
    }

    private static final class PartialMatchContractStrategy implements PartialMatchStrategy {

        @Override
        public Predicate buildPredicate(jakarta.persistence.criteria.Path<String> path, CriteriaBuilder cb,
                PartialMatchField field, PartialMatchToken token) {
            return cb.conjunction();
        }
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EntityScan(basePackages = {"com.blawdgourmet.blawdtrack", "com.blawdgourmet.testsupport.matching"})
    static class TestEntityConfiguration {
    }
}