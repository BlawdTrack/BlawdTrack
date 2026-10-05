package com.blawdgourmet.blawdtrack.packages;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.blawdgourmet.blawdtrack.packages.mapper.PackageSearchMapper;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchPageRequestFactory;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTermNormalizer;
import com.blawdgourmet.blawdtrack.packages.service.impl.PackageSearchServiceImpl;

@ExtendWith(MockitoExtension.class)
class PackageSearchServiceImplTest {

    @Mock private DeliveryPackageSearchRepository repository;
    @Mock private PackageSearchCriterion criterion;

    private PackageSearchServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new PackageSearchServiceImpl(repository, List.of(criterion),
                new PackageSearchTermNormalizer(), new PackageSearchPageRequestFactory(),
                new PackageSearchMapper());
    }

    @Test
    void blankTermUsesUnfilteredRepositorySearchAndMapsThePage() {
        DeliveryPackage entity = packageEntity();
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "id"));
        when(repository.findAll(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entity), pageable, 1));

        var response = service.search(new PackageSearchQuery("  ", null, null));

        verify(repository).findAll(any(Pageable.class));
        verifyNoInteractions(criterion);
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).shipmentNumber()).isEqualTo("ENV-00001");
        assertThat(response.page()).isZero();
        assertThat(response.size()).isEqualTo(20);
        assertThat(response.totalElements()).isEqualTo(1);
    }

    @Test
    void termUsesCombinedSpecificationAndRequestedPage() {
        DeliveryPackage entity = packageEntity();
        Pageable pageable = PageRequest.of(2, 5, Sort.by(Sort.Direction.DESC, "id"));
        Specification<DeliveryPackage> specification = (root, query, builder) -> builder.conjunction();
        when(criterion.toSpecification(any())).thenReturn(specification);
        when(repository.findAll(eq(specification), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(entity), pageable, 11));

        var response = service.search(new PackageSearchQuery("order", "2", "5"));

        verify(criterion).toSpecification(any());
        verify(repository).findAll(eq(specification), any(Pageable.class));
        assertThat(response.page()).isEqualTo(2);
        assertThat(response.size()).isEqualTo(5);
        assertThat(response.totalElements()).isEqualTo(11);
        assertThat(response.totalPages()).isEqualTo(3);
    }

    @Test
    void additionalCriterionIsUsedWithoutChangingTheService() {
        AtomicBoolean criterionUsed = new AtomicBoolean();
        PackageSearchCriterion additionalCriterion = term -> {
            criterionUsed.set(true);
            return (root, query, builder) -> builder.equal(root.get("shipmentNumber"), "FAKE");
        };
        PackageSearchServiceImpl extensibleService = new PackageSearchServiceImpl(repository,
                List.of(additionalCriterion), new PackageSearchTermNormalizer(),
                new PackageSearchPageRequestFactory(), new PackageSearchMapper());
        Pageable pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "id"));
        when(repository.findAll(org.mockito.ArgumentMatchers.<Specification<DeliveryPackage>>any(),
            any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        extensibleService.search(new PackageSearchQuery("fake", null, null));

        assertThat(criterionUsed).isTrue();
        verify(repository).findAll(org.mockito.ArgumentMatchers.<Specification<DeliveryPackage>>any(),
            any(Pageable.class));
    }

    private DeliveryPackage packageEntity() {
        return DeliveryPackage.builder().id(1L).shipmentNumber("ENV-00001")
                .orderNumber("SO-001").customerName("Cliente Uno")
                .address("Del parque 100m norte, Escazu, San Jose, Costa Rica")
                .phone("+506-8888-9999").schedule("De 8 a 5").build();
    }
}