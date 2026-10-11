package com.blawdgourmet.blawdtrack.packages.service.impl;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.mapper.PackageSearchMapper;
import com.blawdgourmet.blawdtrack.packages.model.DeliveryPackage;
import com.blawdgourmet.blawdtrack.packages.repository.DeliveryPackageSearchRepository;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchCriterion;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchPageRequestFactory;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTerm;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchTermNormalizer;
import com.blawdgourmet.blawdtrack.packages.service.PackageSearchService;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PackageSearchServiceImpl implements PackageSearchService {

    private final DeliveryPackageSearchRepository repository;
    private final List<PackageSearchCriterion> criteria;
    private final PackageSearchTermNormalizer termNormalizer;
    private final PackageSearchPageRequestFactory pageRequestFactory;
    private final PackageSearchMapper mapper;

    @Override
    public PageResponse<PackageSearchResponse> search(PackageSearchQuery query) {
        Pageable pageable = pageRequestFactory.create(query.page(), query.size());
        Page<DeliveryPackage> packages = termNormalizer.normalize(query.term())
                .map(term -> repository.findAll(combineCriteria(term), pageable))
                .orElseGet(() -> repository.findAll(pageable));
        return PageResponse.from(packages.map(mapper::toResponse));
    }

    private Specification<DeliveryPackage> combineCriteria(PackageSearchTerm term) {
        return criteria.stream()
                .map(criterion -> criterion.toSpecification(term))
                .reduce(Specification::or)
                .orElse((root, query, builder) -> builder.disjunction());
    }
}