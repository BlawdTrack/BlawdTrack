package com.blawdgourmet.blawdtrack.packages.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;
import com.blawdgourmet.blawdtrack.packages.service.PackageDeletionService;
import com.blawdgourmet.blawdtrack.users.constant.RoleName;

import lombok.RequiredArgsConstructor;

/**
 * Eliminación de paquetes (HU-012). Solo delega en el servicio. Es del rol Administrador de Ventas y del
 * Super Usuario (T02): {@code SecurityConfig} la exige para {@code DELETE /api/v1/packages/*} y
 * {@code @PreAuthorize} la refuerza como segunda barrera.
 */
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageDeletionController {

    private final PackageDeletionService deletionService;

    @DeleteMapping("/{shipmentNumber}")
    @PreAuthorize("hasAnyRole('" + RoleName.SALES_ADMIN + "', '" + RoleName.SUPER_USER + "')")
    public PackageDeletionResponse deletePackage(
            @PathVariable String shipmentNumber,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return deletionService.deletePackage(shipmentNumber, actor);
    }
}
