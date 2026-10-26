package com.blawdgourmet.blawdtrack.packages.service;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;

import java.util.Map;

public interface PackageSearchService {

    PageResponse<PackageSearchResponse> search(PackageSearchQuery query);

    /** Cantidad de paquetes por estado (clave: nombre del estado), con 0 en los estados sin paquetes. */
    Map<String, Long> countByStatus();
}