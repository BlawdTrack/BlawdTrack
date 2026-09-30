package com.blawdgourmet.blawdtrack.couriers.controller;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.blawdgourmet.blawdtrack.common.dto.ErrorResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierHistoryEntry;
import com.blawdgourmet.blawdtrack.couriers.dto.CourierResponse;
import com.blawdgourmet.blawdtrack.couriers.dto.CreateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierPasswordRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierRequest;
import com.blawdgourmet.blawdtrack.couriers.dto.UpdateCourierStatusRequest;
import com.blawdgourmet.blawdtrack.couriers.service.CourierHasActiveAssignmentsException;
import com.blawdgourmet.blawdtrack.couriers.service.CourierNotFoundException;
import com.blawdgourmet.blawdtrack.couriers.service.CourierService;
import com.blawdgourmet.blawdtrack.couriers.service.DuplicateCourierException;
import com.blawdgourmet.blawdtrack.users.model.UserStatus;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * API de mensajeros (HU-003, HU-004 y HU-005). Todos los endpoints son exclusivos del Super Usuario:
 * lo exige {@code SecurityConfig} para {@code /api/v1/couriers/**} y lo refuerza {@code @PreAuthorize}
 * en {@link CourierService}.
 */
@RestController
@RequestMapping("/api/v1/couriers")
@RequiredArgsConstructor
public class CourierController {
    private final CourierService service;

    /** Lista todos los mensajeros, activos e inactivos, ordenados por nombre. */
    @GetMapping
    public List<CourierResponse> list() {
        return service.list();
    }

    /**
     * Registra un mensajero con estado activo y rol MENSAJERO. La contraseña temporal se envía por
     * correo y nunca aparece en la respuesta.
     *
     * @return 201 con el mensajero creado; 400 si hay datos inválidos; 409 si el documento, correo o
     *         teléfono ya existen
     */
    @PostMapping
    public ResponseEntity<CourierResponse> register(@Valid @RequestBody CreateCourierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.register(request));
    }

    /**
     * Actualiza nombre, correo, teléfono, horario y capacidad de carga.
     *
     * @param id id numérico del mensajero o su número de documento
     */
    @PutMapping("/{id}")
    public CourierResponse update(@PathVariable String id,
                                  @Valid @RequestBody UpdateCourierRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public CourierResponse changeStatus(@PathVariable String id,
                                        @Valid @RequestBody UpdateCourierStatusRequest request) {
        return service.changeStatus(id, request.status());
    }

    @PatchMapping("/{id}/deactivate")
    public CourierResponse deactivate(@PathVariable String id) {
        return service.changeStatus(id, UserStatus.INACTIVE);
    }

    @PatchMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable String id,
                                               @Valid @RequestBody UpdateCourierPasswordRequest request) {
        service.changePassword(id, request.password());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public List<CourierHistoryEntry> history(@PathVariable String id) {
        return service.history(id);
    }

    @ExceptionHandler(CourierHasActiveAssignmentsException.class)
    public ResponseEntity<ErrorResponse> hasActiveAssignments(CourierHasActiveAssignmentsException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.builder()
                .code("COURIER_HAS_ACTIVE_ASSIGNMENTS").message(ex.getMessage()).status(409).build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> invalidRequest(MethodArgumentNotValidException ex) {
        // No incluir valores rechazados: podrían contener la contraseña.
        String fields = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField()).distinct().sorted()
                .collect(java.util.stream.Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ErrorResponse.builder().code("VALIDATION_FAILED")
                .message("Revise los campos: " + fields).status(400).build());
    }

    @ExceptionHandler(DuplicateCourierException.class)
    public ResponseEntity<ErrorResponse> duplicate(DuplicateCourierException ex) {
        return conflict(ex.getMessage());
    }

    @ExceptionHandler(CourierNotFoundException.class)
    public ResponseEntity<ErrorResponse> notFound(CourierNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErrorResponse.builder()
                .code("COURIER_NOT_FOUND").message(ex.getMessage()).status(404).build());
    }

    /** Las restricciones únicas de la base protegen frente a registros simultáneos: 409 genérico. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> integrityConflict(DataIntegrityViolationException ex) {
        return conflict("Los datos del mensajero entran en conflicto con un registro existente");
    }

    private ResponseEntity<ErrorResponse> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ErrorResponse.builder()
                .code("COURIER_CONFLICT").message(message).status(409).build());
    }
}
