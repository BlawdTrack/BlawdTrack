package com.blawdgourmet.blawdtrack.packages.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.security.AuthenticatedUser;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDeletionResponse;
import com.blawdgourmet.blawdtrack.packages.service.PackageDeletionService;

import lombok.RequiredArgsConstructor;

/**
 * Eliminación de paquetes (HU-012). Solo delega en el servicio; la restricción al rol
 * Administrador de Ventas la aplica {@code SecurityConfig} (T02).
 */
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageDeletionController {

    private final PackageDeletionService deletionService;

    @DeleteMapping("/{shipmentNumber}")
    public PackageDeletionResponse deletePackage(
            @PathVariable String shipmentNumber,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return deletionService.deletePackage(shipmentNumber, actor);
    }
}
