package com.blawdgourmet.blawdtrack.packages.service.impl;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.mapper.PackageSearchMapper;
import com.blawdgourmet.blawdtrack.packages.matching.PartialMatchField;
import com.blawdgourmet.blawdtrack.packages.matching.PartialMatchSpecificationFactory;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.model.PackageStatus;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchPageRequestFactory;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;
import com.blawdgourmet.blawdtrack.packages.service.PackageSearchService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PackageSearchServiceImpl implements PackageSearchService {

    private static final Specification<DeliveryPackage> MATCH_ALL = (root, query, builder) -> builder.conjunction();

    private static final List<PartialMatchField> SEARCH_FIELDS = List.of(
            PartialMatchField.text("shipmentNumber"),
            PartialMatchField.text("orderNumber"),
            PartialMatchField.text("customerName"),
            PartialMatchField.text("address"),
            PartialMatchField.phone("phone"),
            PartialMatchField.text("schedule"));

    private final DeliveryPackageSearchRepository repository;
    private final PartialMatchSpecificationFactory specificationFactory;
    private final PackageSearchPageRequestFactory pageRequestFactory;
    private final PackageSearchMapper mapper;

    @Override
    public PageResponse<PackageSearchResponse> search(PackageSearchQuery query) {
        Pageable pageable = pageRequestFactory.create(query.page(), query.size());
        Specification<DeliveryPackage> specification = specificationFactory
                .<DeliveryPackage>create(query.term(), fieldsFor(query.field()))
                .orElse(MATCH_ALL);
        Specification<DeliveryPackage> byStatus = statusOf(query.status())
                .<Specification<DeliveryPackage>>map(status -> (root, cq, cb) -> cb.equal(root.get("status"), status))
                .orElse(MATCH_ALL);
        Page<DeliveryPackage> packages = repository.findAll(specification.and(byStatus), pageable);
        return PageResponse.from(packages.map(mapper::toResponse));
    }

    @Override
    public Map<String, Long> countByStatus() {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (PackageStatus status : PackageStatus.values()) {
            counts.put(status.name(), 0L);
        }
        repository.countGroupedByStatus()
                .forEach(row -> counts.put(((PackageStatus) row[0]).name(), (Long) row[1]));
        return counts;
    }

    private static Optional<PackageStatus> statusOf(String status) {
        return Arrays.stream(PackageStatus.values())
                .filter(candidate -> candidate.name().equalsIgnoreCase(status == null ? "" : status.trim()))
                .findFirst();
    }

    private static List<PartialMatchField> fieldsFor(String field) {
        return SEARCH_FIELDS.stream()
                .filter(candidate -> candidate.attributeName().equals(field))
                .findFirst()
                .map(List::of)
                .orElse(SEARCH_FIELDS);
    }
}
