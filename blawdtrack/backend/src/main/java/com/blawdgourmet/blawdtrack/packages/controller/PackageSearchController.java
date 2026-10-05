package com.blawdgourmet.blawdtrack.packages.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.dto.PageResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageSearchResponse;
import com.blawdgourmet.blawdtrack.packages.search.PackageSearchQuery;
import com.blawdgourmet.blawdtrack.packages.service.PackageSearchService;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageSearchController {

    private static final String SEARCH_ROLES = "hasAnyRole('" + RoleName.SALES_ADMIN
            + "','" + RoleName.SUPER_USER + "')";

    private final PackageSearchService searchService;

    @GetMapping("/search")
    @PreAuthorize(SEARCH_ROLES)
    public ResponseEntity<PageResponse<PackageSearchResponse>> search(
            @RequestParam(name = "term", required = false) String term,
            @RequestParam(name = "page", required = false) String page,
            @RequestParam(name = "size", required = false) String size) {
        return ResponseEntity.ok(searchService.search(new PackageSearchQuery(term, page, size)));
    }
}