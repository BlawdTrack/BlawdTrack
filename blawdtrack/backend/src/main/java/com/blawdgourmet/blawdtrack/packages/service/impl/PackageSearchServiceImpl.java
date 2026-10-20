package com.blawdgourmet.blawdtrack.packages.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.mapper.PackageSearchMapper;
import com.blawdgourmet.blawdtrack.packages.matching.PartialMatchField;
import com.blawdgourmet.blawdtrack.packages.matching.PartialMatchSpecificationFactory;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchPageRequestFactory;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;
import com.blawdgourmet.blawdtrack.packages.service.PackageSearchService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PackageSearchServiceImpl implements PackageSearchService {

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
        Page<DeliveryPackage> packages = specificationFactory
            .<DeliveryPackage>create(query.term(), fieldsFor(query.field()))
            .map(specification -> repository.findAll(specification, pageable))
                .orElseGet(() -> repository.findAll(pageable));
        return PageResponse.from(packages.map(mapper::toResponse));
    }

    private static List<PartialMatchField> fieldsFor(String field) {
        return SEARCH_FIELDS.stream()
                .filter(candidate -> candidate.attributeName().equals(field))
                .findFirst()
                .map(List::of)
                .orElse(SEARCH_FIELDS);
    }
}
