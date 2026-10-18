package com.blawdgourmet.blawdtrack.packages.controller;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.blawdgourmet.blawdtrack.common.dto.ApiError;
import com.blawdgourmet.blawdtrack.packages.service.PackageDeliveredException;
import com.blawdgourmet.blawdtrack.packages.service.PackageDispatchedException;
import com.blawdgourmet.blawdtrack.packages.service.PackageNotFoundException;

/**
 * Traduce al formato unificado de errores las excepciones propias de los paquetes (HU-012). Vive en el módulo de
 * paquetes para que el manejador global no dependa de él (los módulos hoja no los referencia nadie de fuera). Tiene
 * prioridad sobre {@code GlobalExceptionHandler}, cuyo manejador de {@code Exception} atraparía estas primero.
 */
@RestControllerAdvice(basePackages = "com.blawdgourmet.blawdtrack.packages")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PackageExceptionHandler {

    @ExceptionHandler(PackageNotFoundException.class)
    public ResponseEntity<ApiError> manejarPaqueteNoEncontrado(PackageNotFoundException ex) {
        return respond("PAQUETE_NO_ENCONTRADO", ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PackageDispatchedException.class)
    public ResponseEntity<ApiError> manejarPaqueteDespachado(PackageDispatchedException ex) {
        return respond("PAQUETE_DESPACHADO", ex.getMessage(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(PackageDeliveredException.class)
    public ResponseEntity<ApiError> manejarPaqueteEntregado(PackageDeliveredException ex) {
        return respond("PAQUETE_ENTREGADO", ex.getMessage(), HttpStatus.CONFLICT);
    }

    private static ResponseEntity<ApiError> respond(String code, String message, HttpStatus status) {
        ApiError error = ApiError.builder()
                .code(code)
                .message(message)
                .status(status.value())
                .build();

        return ResponseEntity.status(status).body(error);
    }
}
