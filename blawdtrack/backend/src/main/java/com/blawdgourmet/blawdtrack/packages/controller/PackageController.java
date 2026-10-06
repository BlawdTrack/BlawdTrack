package com.blawdgourmet.blawdtrack.packages.controller;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.packages.dto.PackageDetailResponse;
import com.blawdgourmet.blawdtrack.packages.service.PackageNotFoundException;
import com.blawdgourmet.blawdtrack.packages.service.PackageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

/**
 * API de consulta de paquetes/envíos (HU-013, Task 124).
 * Endpoint accesible solo para administradores de ventas (ADMIN_VENTAS).
 */
@RestController
@RequestMapping("/api/v1/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService service;

    /**
     * Obtiene el detalle completo de un paquete por su número de envío.
     *
     * @param shipmentNumber número de envío del paquete
     * @return 200 con el detalle del paquete; 404 si no existe
     */
    @GetMapping("/{shipmentNumber}")
    public PackageDetailResponse getPackageByShipmentNumber(@PathVariable String shipmentNumber) {
        return service.getPackageByShipmentNumber(shipmentNumber);
    }

    @ExceptionHandler(PackageNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(PackageNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.builder()
                .code("PACKAGE_NOT_FOUND")
                .message(ex.getMessage())
                .status(404)
                .build());
    }
}