package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;

public interface PackageSearchService {

    PageResponse<PackageSearchResponse> search(PackageSearchQuery query);
}